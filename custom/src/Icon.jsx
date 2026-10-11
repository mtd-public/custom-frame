import '../../dashboard/js/icons.js'; // defines window.ICONS: Wes's 24×24 stroke icon set

/** <Icon name="sun" size={28} />. Names: see dashboard/js/icons.js. */
export default function Icon({ name, size = 24, className = '' }) {
  return (
    <svg
      className={'i ' + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: (window.ICONS && window.ICONS[name]) || '' }}
    />
  );
}
