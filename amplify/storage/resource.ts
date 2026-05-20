import { defineStorage } from '@aws-amplify/backend';

export const notesStorage = defineStorage({
  name: 'notes',
});
