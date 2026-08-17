import type { WheelEvent } from 'react';

/** Prevent touchpad/mouse-wheel from changing focused number inputs. */
export const numberInputSlotProps = {
  htmlInput: {
    onWheel: (e: WheelEvent<HTMLInputElement>) => {
      e.currentTarget.blur();
    },
  },
};
