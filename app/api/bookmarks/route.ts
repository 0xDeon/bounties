import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { graphqlRequest } from "@/lib/server-graphql";
import type { Bookmark } from "@/lib/graphql/generated";

/**
 * GET /api/bookmarks
 * Returns all bookmarked bounties for the current user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query GraphQL for bookmarks with full bounty details
    const BOOKMARKS_QUERY = `
      query GetBookmarks {
        bookmarks {
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

    const data = await graphqlRequest<{ bookmarks: Bookmark[] }>(
      BOOKMARKS_QUERY,
    );

    return NextResponse.json(data.bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 },
    );
  }
}
