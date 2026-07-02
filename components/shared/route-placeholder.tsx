type RoutePlaceholderProps = {
  title: string;
};

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <main aria-label={`${title} route placeholder`}>
      <h1>{title}</h1>
    </main>
  );
}
