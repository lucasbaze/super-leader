import { SinglePersonSummary } from './schemas';

export function formatAiSummaryOfPersonToDisplay(summary: SinglePersonSummary): string {
  return formatSummaryForDisplay(summary);
}

/**
 * @internal Use `formatAiSummaryOfPersonToDisplay` instead.
 */
export function formatSummaryForDisplay(summary: SinglePersonSummary): string {
  let output = `Summary\n\n`;

  if (!summary) {
    return 'No summary available';
  }

  summary.groupedSections.forEach((group, groupIndex) => {
    output += `Section ${groupIndex + 1}\n`;
    group.sections.forEach((section) => {
      output += `${section.title}: ${section.content.trim()}\n`;
    });
    output += `\n`;
  });

  output += `\nInsight Recommendations\n\n`;
  summary.insightRecommendations.forEach((rec) => {
    output += `• ${rec.title}: ${rec.insightRecommendation.trim()}\n`;
  });

  output += `\nFollow-Up Questions\n\n`;
  summary.followUpQuestions.forEach((q, i) => {
    output += `${i + 1}. ${q}\n`;
  });

  return output.trim();
}
