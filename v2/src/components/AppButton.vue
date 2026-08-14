<script setup>
// Ink border with a 3px hard offset shadow. Pressing moves the button onto its
// shadow rather than animating a colour.
//
// The design rounds its controls — the written brief's "no radius anywhere" did
// not survive contact with the mockup. `pill` is the design's most common
// control shape; `sm` is the squarer card-style button.
//
// Named AppButton rather than Button so it never collides with the HTML element
// in templates or in devtools.
defineProps({
  variant: { type: String, default: 'primary' }, // primary | quiet | seal | solid
  shape: { type: String, default: 'pill' },      // pill | sm
  as: { type: String, default: 'button' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :disabled="as === 'button' ? disabled : undefined"
    class="btn"
    :class="[`btn--${variant}`, `btn--${shape}`]"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  padding: var(--s-3) var(--s-6);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  background-color: var(--c-panel);
  color: var(--c-ink);
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-tight);
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: transform 90ms ease-out, box-shadow 90ms ease-out;
}

.btn--pill { border-radius: var(--r-pill); }
.btn--sm { border-radius: var(--r-sm); }

.btn--primary { background-color: var(--c-button); }
.btn--seal { background-color: var(--c-seal); color: var(--c-on-red); }
.btn--solid { background-color: var(--c-red-solid); color: var(--c-on-red); }
.btn--quiet { background-color: transparent; }

.btn:hover:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--c-ink);
}

/* Pressed sits fully on its shadow. */
.btn:active:not(:disabled) {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 var(--c-ink);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: var(--shadow-hard);
  transform: none;
}
</style>
