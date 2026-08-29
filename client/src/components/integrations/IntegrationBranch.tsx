import type { CSSProperties } from 'react';
import type { IntegrationNode } from './integrationData';

type IntegrationBranchProps = {
  integration: IntegrationNode;
  hubX: number;
  hubY: number;
};

function IntegrationBranch({ integration, hubX, hubY }: IntegrationBranchProps) {
  const branchStyle = {
    '--branch-delay': `-${integration.animationDelay}ms`,
  } as CSSProperties;

  const nodeStyle = {
    left: `${integration.x}%`,
    top: `${integration.y}%`,
  };

  return (
    <>
      <svg
        className="integration-branch-wire"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={branchStyle}
      >
        <line
          className="integration-branch-base"
          x1={integration.x}
          y1={integration.y}
          x2={hubX}
          y2={hubY}
          pathLength="100"
        />
        <line
          className="integration-branch-energy"
          x1={integration.x}
          y1={integration.y}
          x2={hubX}
          y2={hubY}
          pathLength="100"
        />
      </svg>

      <div
        className={`integration-node integration-node-${integration.size}`}
        style={nodeStyle}
      >
        <img src={integration.imageSrc} alt={integration.name} decoding="async" />
      </div>
    </>
  );
}

export default IntegrationBranch;
