import type { BlueprintNode } from "@/modules/builder/types";

export function applyRichContent(
  blueprint: BlueprintNode,
  contentData: Record<string, any>
): BlueprintNode {
  function traverse(node: BlueprintNode): BlueprintNode {
    const sectionContent = contentData[node.id];
    
    if (sectionContent && node.props) {
      // Apply heading
      if (sectionContent.heading?.primary) {
        node.props.headingText = sectionContent.heading.primary;
        node.props.subheadingText = sectionContent.heading.secondary;
      }
      
      // Apply main content
      if (sectionContent.content?.main) {
        node.props.descriptionText = sectionContent.content.main;
        node.props.supportingText = sectionContent.content.supporting;
      }
      
      // Apply CTAs
      if (sectionContent.ctas) {
        node.props.primaryCTA = sectionContent.ctas.primary;
        node.props.secondaryCTA = sectionContent.ctas.secondary;
      }
      
      // Apply social proof
      if (sectionContent.socialProof) {
        node.props.socialProofStat = sectionContent.socialProof.stat;
        node.props.trustElement = sectionContent.socialProof.trust;
      }
      
      // Apply features array
      if (sectionContent.features && Array.isArray(sectionContent.features)) {
        node.props.features = sectionContent.features;
      }
      
      // Apply testimonials
      if (sectionContent.testimonials && Array.isArray(sectionContent.testimonials)) {
        node.props.testimonials = sectionContent.testimonials;
      }
      
      // Apply pricing tiers
      if (sectionContent.tiers && Array.isArray(sectionContent.tiers)) {
        node.props.pricingTiers = sectionContent.tiers;
      }
    }
    
    // Recursively apply to children
    if (node.children) {
      node.children = node.children.map(traverse);
    }
    
    return node;
  }
  
  return traverse(blueprint);
}
