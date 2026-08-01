import {sql} from 'drizzle-orm';
import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth/dal';
import {db} from '@/lib/db';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';
import {createIncidentId} from '@/lib/observability/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noStoreHeaders = {
  'Cache-Control': 'no-store',
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {status: 'unauthorized'},
      {status: 401, headers: noStoreHeaders},
    );
  }

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
