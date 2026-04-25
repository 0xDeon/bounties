import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { graphqlRequest } from "@/lib/server-graphql";
import type { Bookmark } from "@/lib/graphql/generated";

/**
 * POST /api/bookmarks/[bountyId]
 * Toggles bookmark state for the given bounty
 * If bookmarked → removes and returns null
 * If not bookmarked → adds and returns bookmark
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bountyId: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bountyId } = await params;

    if (!bountyId) {
      return NextResponse.json(
        { error: "bountyId is required" },
        { status: 400 },
      );
    }

    // Call GraphQL mutation to toggle bookmark
    const TOGGLE_BOOKMARK_MUTATION = `
      mutation ToggleBookmark($input: ToggleBookmarkInput!) {
        toggleBookmark(input: $input) {
          id
          userId
          bountyId
          createdAt
          bounty {
            id
            title
            description
            status
            type
            rewardAmount
            rewardCurrency
            createdAt
            updatedAt
            organizationId
            projectId
            bountyWindowId
            githubIssueUrl
            githubIssueNumber
            createdBy
            organization {
              id
              name
              logo
              slug
            }
            project {
              id
              title
              description
            }
            bountyWindow {
              id
              name
              status
              startDate
              endDate
            }
            _count {
              submissions
            }
          }
        }
      }
    `;

    const data = await graphqlRequest<{ toggleBookmark: Bookmark | null }>(
      TOGGLE_BOOKMARK_MUTATION,
      { input: { bountyId } },
    );

    // GraphQL mutation returns the bookmark when added, null when removed
    if (data.toggleBookmark) {
      return NextResponse.json(data.toggleBookmark);
    } else {
      return NextResponse.json(null, { status: 200 });
    }
  } catch (error: unknown) {
    console.error("Error toggling bookmark:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
