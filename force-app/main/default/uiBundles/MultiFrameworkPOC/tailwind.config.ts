// Salesforce Multi-Framework injects * { margin: 0; padding: 0 } as unlayered CSS.
// CSS Cascade Level 5: unlayered styles beat all @layer styles regardless of
// specificity, so Tailwind's utility classes lose on the platform.
// Setting important: true makes every utility !important, which beats
// any normal (non-!important) unlayered declaration, regardless of layer status.
export default {
  important: true,
};
