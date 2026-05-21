import { randomBytes } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';

const BUCKET = process.env.NOTES_BUCKET_NAME!;
const PREFIX = process.env.NOTES_PREFIX ?? 'notes/';
const MAX_NOTE_BYTES = 1_000_000;
const ID_LENGTH = 16;
const ID_RE = /^[A-Za-z0-9]{16}$/;
const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const s3 = new S3Client({});

function generateId(): string {
  const bytes = randomBytes(ID_LENGTH);
  let out = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    out += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  }
  return out;
}

function json(statusCode: number, body: unknown): LambdaFunctionURLResult {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function createNote(rawBody: string | undefined): Promise<LambdaFunctionURLResult> {
  if (!rawBody) return json(400, { error: 'empty body' });
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json(400, { error: 'invalid json' });
  }
  const text = (parsed as { text?: unknown })?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return json(400, { error: 'text must be a non-empty string' });
  }
  const size = Buffer.byteLength(text, 'utf8');
  if (size > MAX_NOTE_BYTES) {
    return json(413, { error: `note exceeds ${MAX_NOTE_BYTES} byte limit` });
  }

  const id = generateId();
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.md`,
      Body: text,
      ContentType: 'text/markdown; charset=utf-8',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return json(201, { id });
}

async function getNote(id: string): Promise<LambdaFunctionURLResult> {
  if (!ID_RE.test(id)) return json(400, { error: 'invalid id' });
  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: `${PREFIX}${id}.md` }),
    );
    const text = await res.Body!.transformToString('utf-8');
    return json(200, { id, text });
  } catch (err) {
    if (err instanceof NoSuchKey || (err as { name?: string })?.name === 'NoSuchKey') {
      return json(404, { error: 'not found' });
    }
    throw err;
  }
}

export const handler = async (
  event: LambdaFunctionURLEvent,
): Promise<LambdaFunctionURLResult> => {
  const method = event.requestContext.http.method.toUpperCase();
  const path = event.requestContext.http.path || '/';
  const match = /^\/notes(?:\/([^/]+))?\/?$/.exec(path);
  if (!match) return json(404, { error: 'not found' });
  const idFromPath = match[1];

  try {
    if (method === 'PUT' || (method === 'POST' && !idFromPath)) {
      return await createNote(event.body);
    }
    if (method === 'GET' && idFromPath) {
      return await getNote(idFromPath);
    }
    return json(405, { error: 'method not allowed' });
  } catch (err) {
    console.error('notes handler error', err);
    return json(500, { error: 'internal error' });
  }
};
