[CmdletBinding()]
param(
  [switch]$Execute
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $Execute) {
  throw 'Explicit confirmation is required. Run with -Execute.'
}

$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$environmentFile = Join-Path $repositoryRoot '.env.local'
$backupDirectory = Join-Path $PSScriptRoot 'backups'
$postgresToolImage = 'postgres:17-alpine@sha256:742f40ea20b9ff2ff31db5458d127452988a2164df9e17441e191f3b72252193'

function Get-PostgresTool {
  param(
    [Parameter(Mandatory)]
    [string]$Name
  )

  $command = Get-Command "$Name.exe" -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $postgresqlRoot = Join-Path $env:ProgramFiles 'PostgreSQL'
  if (Test-Path -LiteralPath $postgresqlRoot -PathType Container) {
    $candidate = Get-ChildItem -LiteralPath $postgresqlRoot -Directory |
      Sort-Object Name -Descending |
      ForEach-Object { Join-Path $_.FullName "bin\$Name.exe" } |
      Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
      Select-Object -First 1

    if ($candidate) {
      return $candidate
    }
  }

  return $null
}

function Get-SupabaseProjectReference {
  param(
    [Parameter(Mandatory)]
    [Uri]$Uri
  )

  $connectionUser = [Uri]::UnescapeDataString(($Uri.UserInfo -split ':', 2)[0])
  if ($connectionUser.StartsWith('postgres.')) {
    return $connectionUser.Substring('postgres.'.Length)
  }

  if ($Uri.Host -match '^db\.([^.]+)\.supabase\.co$') {
    return $Matches[1]
  }

  return $null
}

function Get-EnvironmentValue {
  param(
    [Parameter(Mandatory)]
    [string]$Name
  )

  $line = Get-Content -LiteralPath $environmentFile |
    Where-Object {
      $trimmed = $_.Trim()
      $trimmed -and
      -not $trimmed.StartsWith('#') -and
      $trimmed.StartsWith("$Name=")
    } |
    Select-Object -Last 1

  if (-not $line) {
    return $null
  }

  return ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
}

if (-not (Test-Path -LiteralPath $environmentFile -PathType Leaf)) {
  throw '.env.local was not found.'
}

$runtimeDatabaseUrl = Get-EnvironmentValue -Name 'DATABASE_URL'
if (-not $runtimeDatabaseUrl) {
  throw 'DATABASE_URL is not configured in .env.local.'
}

$backupDatabaseUrl = Get-EnvironmentValue -Name 'DATABASE_BACKUP_URL'
$runtimeUri = [Uri]$runtimeDatabaseUrl

if (-not $backupDatabaseUrl) {
  if (
    $runtimeUri.Port -ne 6543 -or
    -not $runtimeUri.Host.EndsWith('.pooler.supabase.com')
  ) {
    throw 'DATABASE_BACKUP_URL is required when a Supabase session-pooler URL cannot be derived safely.'
  }

  $backupUriBuilder = [UriBuilder]$runtimeUri
  $backupUriBuilder.Port = 5432
  $backupDatabaseUrl = $backupUriBuilder.Uri.AbsoluteUri
}

$backupUri = [Uri]$backupDatabaseUrl
if ($backupUri.Port -ne 5432) {
  throw 'Backups must use a direct or session-pooler connection on port 5432.'
}

if (
  $backupUri.Scheme -ne 'postgresql' -and
  $backupUri.Scheme -ne 'postgres'
) {
  throw 'DATABASE_BACKUP_URL must use postgres:// or postgresql://.'
}

$runtimeProjectReference = Get-SupabaseProjectReference -Uri $runtimeUri
$backupProjectReference = Get-SupabaseProjectReference -Uri $backupUri
if (
  -not $runtimeProjectReference -or
  -not $backupProjectReference -or
  $runtimeProjectReference -ne $backupProjectReference
) {
  throw 'The backup and runtime URLs could not be verified as the same Supabase project.'
}

if ($runtimeUri.AbsolutePath -ne $backupUri.AbsolutePath) {
  throw 'The backup and runtime URLs must target the same database.'
}

$pgDump = Get-PostgresTool -Name 'pg_dump'
$pgRestore = Get-PostgresTool -Name 'pg_restore'
$docker = Get-Command docker.exe -ErrorAction SilentlyContinue
$useDocker = -not $pgDump -or -not $pgRestore

if ($useDocker -and -not $docker) {
  throw 'PostgreSQL client tools or Docker are required before running a production change.'
}

if ($useDocker) {
  & $docker.Source version --format '{{.Server.Version}}' | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'Docker is installed but not running. Start Docker Desktop before running a production change.'
  }
}

$userInfo = $backupUri.UserInfo -split ':', 2
if ($userInfo.Count -ne 2) {
  throw 'The backup connection must include a username and password.'
}

$databaseUser = [Uri]::UnescapeDataString($userInfo[0])
$databasePassword = [Uri]::UnescapeDataString($userInfo[1])
$databaseName = $backupUri.AbsolutePath.TrimStart('/')
if (-not $databaseName) {
  throw 'The backup connection must include a database name.'
}

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$timestamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ')
$backupFile = Join-Path $backupDirectory "finance-tracker-pre-update-august-2026-category-budgets-$timestamp.dump"
$backupFileName = [IO.Path]::GetFileName($backupFile)

$previousPgPassword = $env:PGPASSWORD
$previousPgSslMode = $env:PGSSLMODE
$previousChangeConfirmation = $env:DATABASE_CHANGE_CONFIRMED
$previousBackupFile = $env:DATABASE_BACKUP_FILE
$previousBackupHash = $env:DATABASE_BACKUP_SHA256
$previousDatabaseUrl = $env:DATABASE_URL

try {
  $env:PGPASSWORD = $databasePassword
  $env:PGSSLMODE = 'require'

  $pgDumpArguments = @(
    "--host=$($backupUri.Host)"
    "--port=$($backupUri.Port)"
    "--username=$databaseUser"
    "--dbname=$databaseName"
    '--schema=public'
    '--format=custom'
    '--no-owner'
    '--no-privileges'
  )

  if ($useDocker) {
    $dockerMount = "type=bind,source=$backupDirectory,target=/backups"
    & $docker.Source run --rm --env PGPASSWORD --env PGSSLMODE --mount $dockerMount $postgresToolImage pg_dump @pgDumpArguments "--file=/backups/$backupFileName"
  } else {
    & $pgDump @pgDumpArguments "--file=$backupFile"
  }

  if ($LASTEXITCODE -ne 0) {
    throw 'pg_dump failed. The production change was not executed.'
  }

  $backupItem = Get-Item -LiteralPath $backupFile
  if ($backupItem.Length -le 0) {
    throw 'The generated backup is empty. The production change was not executed.'
  }

  if ($useDocker) {
    $backupContents = & $docker.Source run --rm --mount $dockerMount $postgresToolImage pg_restore --list "/backups/$backupFileName"
  } else {
    $backupContents = & $pgRestore --list $backupFile
  }
  if ($LASTEXITCODE -ne 0 -or -not $backupContents) {
    throw 'pg_restore could not validate the backup. The production change was not executed.'
  }

  if (-not ($backupContents -match 'TABLE DATA public categories')) {
    throw 'The backup does not contain public.categories data. The production change was not executed.'
  }
  if (-not ($backupContents -match 'TABLE DATA public monthly_budgets')) {
    throw 'The backup does not contain public.monthly_budgets data. The production change was not executed.'
  }
  if (-not ($backupContents -match 'TABLE DATA public monthly_budget_categories')) {
    throw 'The backup does not contain public.monthly_budget_categories data. The production change was not executed.'
  }

  $backupHash = (Get-FileHash -LiteralPath $backupFile -Algorithm SHA256).Hash.ToLowerInvariant()
  $backupHashFile = "$backupFile.sha256"
  Set-Content -LiteralPath $backupHashFile -Value "$backupHash  $($backupItem.Name)" -Encoding utf8NoBOM

  $env:DATABASE_URL = $runtimeDatabaseUrl
  $env:DATABASE_CHANGE_CONFIRMED = 'UPDATE_AUGUST_2026_CATEGORY_BUDGETS'
  $env:DATABASE_BACKUP_FILE = $backupFile
  $env:DATABASE_BACKUP_SHA256 = $backupHash

  Push-Location $repositoryRoot
  try {
    & pnpm exec tsx --env-file=.env.local scripts/database/update-august-2026-category-budgets.ts
    if ($LASTEXITCODE -ne 0) {
      throw 'The August 2026 category budget change failed. The verified backup remains available.'
    }
  } finally {
    Pop-Location
  }

  Write-Output "Verified backup: $backupFile"
  Write-Output "Backup checksum: $backupHashFile"
  Write-Output "Backup SHA-256: $backupHash"
  Write-Output 'August 2026 category budgets were updated and verified.'
} finally {
  $env:PGPASSWORD = $previousPgPassword
  $env:PGSSLMODE = $previousPgSslMode
  $env:DATABASE_CHANGE_CONFIRMED = $previousChangeConfirmation
  $env:DATABASE_BACKUP_FILE = $previousBackupFile
  $env:DATABASE_BACKUP_SHA256 = $previousBackupHash
  $env:DATABASE_URL = $previousDatabaseUrl
}
