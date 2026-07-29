import {sql} from 'drizzle-orm';
import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';
import {createIncidentId} from '@/lib/observability/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noStoreHeaders = {
  'Cache-Control': 'no-store',
};

export async function GET() {
  const incidentId = createIncidentId();

  try {
    await withDatabaseDiagnostics(
      'health.database.check',
      () => db.execute(sql`select 1`),
      {incidentId},
    );

    return NextResponse.json(
      {status: 'ok', incidentId: null},
      {status: 200, headers: noStoreHeaders},
    );
  } catch {
    return NextResponse.json(
      {status: 'degraded', incidentId},
      {status: 503, headers: noStoreHeaders},
    );
  }
}
