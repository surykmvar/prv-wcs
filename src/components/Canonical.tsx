import { Helmet } from "react-helmet-async"

interface CanonicalProps {
  url: string
}

export const Canonical = ({ url }: CanonicalProps) => {
  // Ensure absolute URL for canonical
  const canonicalUrl = url.startsWith('http') ? url : `https://woices.app${url}`
  
  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  )
}