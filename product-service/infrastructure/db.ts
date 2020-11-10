import { createPool } from 'slonik';

const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;

export const pg = createPool(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`);
