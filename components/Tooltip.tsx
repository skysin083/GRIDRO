export default function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group ml-1 align-middle">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-neutral-200 text-neutral-600 text-[10px] cursor-help">
        i
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 rounded-md bg-neutral-900 text-white text-caption p-2 leading-snug z-20">
        {text}
      </span>
    </span>
  );
}
