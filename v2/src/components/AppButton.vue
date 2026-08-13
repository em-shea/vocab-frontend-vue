<script setup>
// 2px ink border, 3px hard shadow, no radius, no blur. Pressing moves the button
// onto its shadow rather than animating a colour.
//
// Named AppButton rather than Button so it never collides with the HTML element
// in templates or in devtools.
defineProps({
  variant: { type: String, default: 'primary' }, // primary | quiet | seal
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
    :class="`btn--${variant}`"
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
  border: var(--border-w) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
  background-color: var(--c-panel);
  color: var(--c-ink);
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: transform 90ms ease-out, box-shadow 90ms ease-out;
}

.btn--primary { background-color: var(--c-button); }
.btn--seal { background-color: var(--c-seal); color: var(--c-panel); }
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
