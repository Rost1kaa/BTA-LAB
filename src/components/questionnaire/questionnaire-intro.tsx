/**
 * BTA LAB branded intro overlay — shown when a questionnaire link opens.
 *
 * The animation is 100% CSS-driven (keyframes in `globals.css`) so it never
 * blocks the questionnaire:
 *
 *   - It always finishes on a fixed timeline (~1.65s total) and ends with
 *     `visibility: hidden` (fill-mode forwards), so the overlay can never
 *     stay stuck over the page — even if JavaScript fails.
 *   - `prefers-reduced-motion` collapses the whole intro instantly and the
 *     questionnaire card loses its entrance delay, so reduced-motion users
 *     go straight to the form.
 *
 * The overlay is purely decorative branding: `aria-hidden` keeps it out of
 * the accessibility tree so assistive tech goes directly to the form.
 */
export function QuestionnaireIntro() {
  return (
    <div className="questionnaire-intro" aria-hidden="true">
      {/* Subtle grid backdrop (mirrors the questionnaire page background) */}
      <div className="questionnaire-intro-pattern" />

      {/* Soft glow orb behind the lockup */}
      <div className="questionnaire-intro-orb" />

      {/* Brand lockup: ბითიეი / ლაბი + latin tagline */}
      <div className="questionnaire-intro-content">
        <span className="questionnaire-intro-word questionnaire-intro-word-1">ბითიეი</span>
        <span className="questionnaire-intro-line" />
        <span className="questionnaire-intro-word questionnaire-intro-word-2">ლაბი</span>
        <span className="questionnaire-intro-tagline-wrap">
          <span className="questionnaire-intro-tick" />
          <span className="questionnaire-intro-tagline">BTA LAB</span>
          <span className="questionnaire-intro-tick" />
        </span>
      </div>
    </div>
  );
}
