import { s, C } from './ui';
export const styles = {
  label: s.label,
  input: s.input,
  disabled: {
    opacity: 0.4
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.teal,
    alignItems: 'center' as const,
    justifyContent: 'center' as const
  },
  addSymbol: {
    fontSize: 28,
    color: C.ink
  },
  cancelButton: {
    paddingVertical: 14
  },
  cancelLabel: {
    fontSize: 15,
    color: '#08787A'
  },
  tripName: s.h3,
  primaryButton: s.button,
  primaryLabel: s.buttonText
};
