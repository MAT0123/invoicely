import { CompanySettings, Invoice } from '../types/invoiceTypes';
import {
  InvoiceAction,
  NewInvoiceAction,
  SettingsAction,
} from '../types/reducerType';

export function invoiceReducer(
  state: Invoice[],
  action: InvoiceAction,
): Invoice[] {
  switch (action.type) {
    case 'SET_INVOICES':
      return action.payload;
    case 'ADD_INVOICE':
      return [...state, action.payload];
    case 'DELETE_INVOICE':
      return state.filter((inv) => inv.id !== action.payload);
    case 'DELETE_ALL_INVOICES':
      return [];
    default:
      return state;
  }
}

export function settingsReducer(
  state: CompanySettings,
  action: SettingsAction,
): CompanySettings {
  switch (action.type) {
    case 'SET_SETTINGS':
      return action.payload;
    default:
      return state;
  }
}

export function newInvoiceReducer(
  state: Partial<Invoice>,
  action: NewInvoiceAction,
): Partial<Invoice> {
  switch (action.type) {
    case 'SET_NEW_INVOICE':
      return action.payload;
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items!.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                [action.payload.field]: action.payload.value,
                amount:
                  action.payload.field === 'quantity' ||
                  action.payload.field === 'rate'
                    ? (action.payload.field === 'quantity'
                        ? Number(action.payload.value)
                        : item.quantity) *
                      (action.payload.field === 'rate'
                        ? Number(action.payload.value)
                        : item.rate)
                    : item.amount,
              }
            : item,
        ),
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [
          ...(state.items || []),
          {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items!.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
}
