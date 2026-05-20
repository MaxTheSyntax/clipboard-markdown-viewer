import { defineFunction } from '@aws-amplify/backend';

export const notesFunction = defineFunction({
  name: 'notes',
  entry: './handler.ts',
  timeoutSeconds: 10,
  memoryMB: 256,
  environment: {
    NOTES_PREFIX: 'notes/',
  },
});
