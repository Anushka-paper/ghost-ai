/**
 * Fetch Clerk user data by email using Clerk Backend API
 * Returns user display name and avatar image if available
 */
export async function getClerkUserByEmail(
  email: string
): Promise<{
  displayName: string;
  avatarUrl: string | null;
} | null> {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('CLERK_SECRET_KEY is not defined');
      return null;
    }

    const response = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return null;
    }

    const user = data.data[0];
    const displayName = user.first_name
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
      : user.primary_email_address;

    return {
      displayName,
      avatarUrl: user.image_url || null,
    };
  } catch (error) {
    console.error('Error fetching Clerk user:', error);
    return null;
  }
}
