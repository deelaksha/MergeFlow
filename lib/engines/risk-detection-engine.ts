import { Conflict, RiskPattern } from "@/lib/types";

/**
 * Risk Detection Engine
 * Identifies high-risk changes in code
 */
export class RiskDetectionEngine {
  private static riskPatterns: RiskPattern[] = [
    // Authentication & Security
    {
      pattern: /(auth|login|password|credential|token|session)/i,
      type: "Authentication Logic",
      severity: "high",
      message: "Authentication logic has been modified",
    },
    {
      pattern: /(encrypt|decrypt|hash|crypto|security)/i,
      type: "Security Configuration",
      severity: "high",
      message: "Security-related code has been modified",
    },

    // Database
    {
      pattern: /(query|execute|sql|database|db\.|mongoose|sequelize)/i,
      type: "Database Query",
      severity: "high",
      message: "Database query has been modified",
    },
    {
      pattern: /(migration|schema|create table|alter table|drop table)/i,
      type: "Database Schema",
      severity: "high",
      message: "Database schema modification detected",
    },

    // API & Network
    {
      pattern: /(api|endpoint|route|controller|@Get|@Post|@Put|@Delete)/i,
      type: "API Signature",
      severity: "high",
      message: "API endpoint or signature has been modified",
    },
    {
      pattern: /(axios|fetch|http|request|response)/i,
      type: "Network Request",
      severity: "medium",
      message: "Network request logic has been modified",
    },

    // Permissions & Authorization
    {
      pattern: /(permission|authorize|role|admin|access control|acl)/i,
      type: "Permission Logic",
      severity: "high",
      message: "Permission or authorization logic has been modified",
    },
    {
      pattern: /(middleware|guard|interceptor|canActivate)/i,
      type: "Middleware/Guard",
      severity: "high",
      message: "Security middleware or guard has been modified",
    },

    // Data Validation
    {
      pattern: /(validate|sanitize|escape|xss|injection)/i,
      type: "Input Validation",
      severity: "high",
      message: "Input validation logic has been modified",
    },

    // Configuration
    {
      pattern: /(config|environment|env|process\.env|settings)/i,
      type: "Configuration",
      severity: "medium",
      message: "Configuration or environment settings modified",
    },

    // Error Handling
    {
      pattern: /(try|catch|throw|error|exception|reject)/i,
      type: "Error Handling",
      severity: "medium",
      message: "Error handling logic has been modified",
    },

    // Critical Operations
    {
      pattern: /(delete|remove|drop|truncate|destroy)/i,
      type: "Destructive Operation",
      severity: "high",
      message: "Destructive operation detected",
    },
    {
      pattern: /(payment|billing|charge|transaction|refund)/i,
      type: "Payment Logic",
      severity: "high",
      message: "Payment or billing logic has been modified",
    },

    // Dependencies
    {
      pattern: /(require\(|import.*from|package\.json|dependencies)/i,
      type: "Dependency Change",
      severity: "medium",
      message: "Dependencies or imports have been modified",
    },
  ];

  /**
   * Analyze conflicts for potential risks
   */
  static analyzeRisks(conflicts: Conflict[]): Conflict[] {
    return conflicts.map((conflict) => {
      const risk = this.detectRisk(conflict);
      return {
        ...conflict,
        riskLevel: risk.level,
        riskReason: risk.reason,
      };
    });
  }

  /**
   * Detect risk in a single conflict
   */
  private static detectRisk(conflict: Conflict): {
    level: "low" | "medium" | "high";
    reason?: string;
  } {
    const content = `${conflict.originalContent}\n${conflict.modifiedContent}`;
    const risks: { severity: "low" | "medium" | "high"; message: string }[] =
      [];

    // Check against all risk patterns
    this.riskPatterns.forEach((pattern) => {
      if (pattern.pattern.test(content)) {
        risks.push({
          severity: pattern.severity,
          message: pattern.message,
        });
      }
    });

    // No risks detected
    if (risks.length === 0) {
      return { level: "low" };
    }

    // Find highest severity
    const hasHigh = risks.some((r) => r.severity === "high");
    const hasMedium = risks.some((r) => r.severity === "medium");

    if (hasHigh) {
      const highRisks = risks.filter((r) => r.severity === "high");
      return {
        level: "high",
        reason: highRisks.map((r) => r.message).join("; "),
      };
    }

    if (hasMedium) {
      const mediumRisks = risks.filter((r) => r.severity === "medium");
      return {
        level: "medium",
        reason: mediumRisks.map((r) => r.message).join("; "),
      };
    }

    return { level: "low" };
  }

  /**
   * Get risk summary for all conflicts
   */
  static getRiskSummary(conflicts: Conflict[]): {
    high: number;
    medium: number;
    low: number;
    total: number;
  } {
    const summary = {
      high: 0,
      medium: 0,
      low: 0,
      total: conflicts.length,
    };

    conflicts.forEach((conflict) => {
      if (conflict.riskLevel === "high") summary.high++;
      else if (conflict.riskLevel === "medium") summary.medium++;
      else summary.low++;
    });

    return summary;
  }

  /**
   * Check if conflict contains sensitive information
   */
  static containsSensitiveData(content: string): boolean {
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,
      /credential/i,
      /private[_-]?key/i,
      /access[_-]?key/i,
      /auth[_-]?token/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(content));
  }
}
