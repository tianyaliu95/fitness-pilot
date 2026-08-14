type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** One script tag per object — array roots break some JSON-LD consumers (`@context` undefined). */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
