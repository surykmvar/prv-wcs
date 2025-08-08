export type OutcomeCode = 'bloom' | 'dust' | 'unclear' | 'none'

export interface OutcomeResult {
  code: OutcomeCode
  label: string
  total: number
  percentages: {
    fact: number
    myth: number
    unclear: number
  }
}

export function computeVoiceOutcome(counts: { fact: number; myth: number; unclear: number }): OutcomeResult {
  const fact = counts.fact || 0
  const myth = counts.myth || 0
  const unclear = counts.unclear || 0
  const total = fact + myth + unclear

  if (total === 0) {
    return { code: 'none', label: 'No votes', total, percentages: { fact: 0, myth: 0, unclear: 0 } }
  }

  const factP = fact / total
  const mythP = myth / total
  const unclearP = unclear / total

  if (factP > 0.5 || fact > (myth + unclear)) {
    return { code: 'bloom', label: 'Bloom 🌱', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
  }
  if (mythP > 0.5 || myth > (fact + unclear)) {
    return { code: 'dust', label: 'Dust 💨', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
  }
  if (unclearP > 0.5) {
    return { code: 'unclear', label: 'Unclear ❓', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
  }

  // Fallback to highest vote if no strict majority
  if (fact >= myth && fact >= unclear) {
    return { code: 'bloom', label: 'Bloom 🌱', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
  }
  if (myth >= fact && myth >= unclear) {
    return { code: 'dust', label: 'Dust 💨', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
  }
  return { code: 'unclear', label: 'Unclear ❓', total, percentages: { fact: factP, myth: mythP, unclear: unclearP } }
}
