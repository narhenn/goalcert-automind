export default function GoalCertLogo({ size = 32, color = '#4902A2' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M78 33 A37 37 0 1 0 80 62 L54 62" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M31 51 L46 65 L70 35" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
