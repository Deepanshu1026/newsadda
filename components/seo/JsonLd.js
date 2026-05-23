import React from "react";

/**
 * JsonLd Injector Component
 * Standardizes schema rendering for crawler engines.
 * 
 * @param {Object} props
 * @param {Object} props.schema - The JSON-LD schema object
 */
export default function JsonLd({ schema }) {
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
