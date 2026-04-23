import { z } from "zod";
import type { PaginationParams, SortParams } from "./types";

// Bounty schemas
const bountyTypeSchema = z.enum([
  "feature",
  "bug",
  "documentation",
  "refactor",
  "other",
]);
const bountyStatusSchema = z.enum(["open", "claimed", "closed"]);
const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
const claimingModelSchema = z.enum([
  "single-claim",
  "application",
  "competition",
  "multi-winner",
]);

export const bountySchema = z.object({
  id: z.string(),
  type: bountyTypeSchema,
  projectId: z.string(),
  projectName: z.string(),
  projectLogoUrl: z.string().nullable(),
  issueTitle: z.string(),
  issueNumber: z.number(),
  githubRepo: z.string(),
  githubIssueUrl: z.string().url(),
  description: z.string(),
  rewardAmount: z.number().nullable(),
  rewardCurrency: z.string(),
  claimingModel: claimingModelSchema,
  difficulty: difficultySchema.nullable(),
  tags: z.array(z.string()),
  status: bountyStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  claimedAt: z.string().optional(),
  claimedBy: z.string().optional(),
  lastActivityAt: z.string().optional(),
  claimExpiresAt: z.string().optional(),
  submissionsEndDate: z.string().optional(),

  requirements: z.array(z.string()).optional(),
  scope: z.string().optional(),
});

export type Bounty = z.infer<typeof bountySchema>;
export type BountyType = z.infer<typeof bountyTypeSchema>;
export type BountyStatus = z.infer<typeof bountyStatusSchema>;
export type DifficultyLevel = z.infer<typeof difficultySchema>;
export type ClaimingModel = z.infer<typeof claimingModelSchema>;

// Query params
export interface BountyListParams extends PaginationParams, SortParams {
  status?: BountyStatus;
  type?: BountyType;
  difficulty?: DifficultyLevel;
  projectId?: string;
  tags?: string | string[];
  search?: string;
}

// Create bounty input
export const createBountySchema = bountySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;

// Update bounty input
export const updateBountySchema = createBountySchema.partial();

export type UpdateBountyInput = z.infer<typeof updateBountySchema>;

// Parse and validate response (use when strict validation needed)
export function parseBounty(data: unknown): Bounty {
  return bountySchema.parse(data);
}

export function parseBountyList(data: unknown): Bounty[] {
  return z.array(bountySchema).parse(data);
}
