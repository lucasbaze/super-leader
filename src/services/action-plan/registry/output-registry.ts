import {
  addNoteActionAdapter,
  buyGiftActionAdapter,
  sendContentActionAdapter,
  sendMessageActionAdapter
} from '../outputs/available-actions';

export const outputActionAdaptersRegistry = [
  sendMessageActionAdapter,
  sendContentActionAdapter,
  addNoteActionAdapter,
  buyGiftActionAdapter
];
