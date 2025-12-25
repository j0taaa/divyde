// API client for frontend

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FriendAvatarData {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinColor: string;
  backgroundColor: string;
}

export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatar?: FriendAvatarData;
  avatarColor?: string;
  balance: number;
  debtCount: number;
}

export interface Debt {
  id: string;
  amount: number;
  direction: "they-owe" | "you-owe";
  description?: string;
  isPaid: boolean;
  date: string;
  paidAt?: string;
  friendId: string;
  friend?: {
    id: string;
    name: string;
    avatar?: FriendAvatarData;
    avatarColor?: string;
  };
}

class ApiClient {
  private async fetch<T>(
    url: string,
    options?: RequestInit
  ): Promise<{ data?: T; error?: string }> {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Something went wrong" };
      }

      return { data };
    } catch (error) {
      console.error("API Error:", error);
      return { error: "Network error" };
    }
  }

  // Auth
  async register(name: string, email: string, password: string) {
    return this.fetch<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.fetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.fetch<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  }

  async getMe() {
    return this.fetch<{ user: User | null }>("/api/auth/me");
  }

  // Friends
  async getFriends() {
    return this.fetch<{ friends: Friend[] }>("/api/friends");
  }

  async getFriend(id: string) {
    return this.fetch<{
      friend: Friend & { debts: Debt[] };
    }>(`/api/friends/${id}`);
  }

  async createFriend(data: {
    name: string;
    email?: string;
    avatarType?: "initials" | "custom";
    avatarColor?: string;
    avatar?: FriendAvatarData;
  }) {
    return this.fetch<{ friend: Friend }>("/api/friends", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteFriend(id: string) {
    return this.fetch<{ success: boolean }>(`/api/friends/${id}`, {
      method: "DELETE",
    });
  }

  // Debts
  async getDebts(filter?: "all" | "outstanding" | "paid", friendId?: string) {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    if (friendId) params.set("friendId", friendId);
    const query = params.toString() ? `?${params.toString()}` : "";

    return this.fetch<{
      debts: Debt[];
      totals: { totalOwed: number; totalOwing: number };
    }>(`/api/debts${query}`);
  }

  async createDebt(data: {
    amount: number;
    direction: "they-owe" | "you-owe";
    description?: string;
    friendIds: string[];
    date?: string;
  }) {
    return this.fetch<{ count: number }>("/api/debts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDebt(id: string, data: { isPaid?: boolean; amount?: number; description?: string }) {
    return this.fetch<{ debt: Debt }>(`/api/debts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDebt(id: string) {
    return this.fetch<{ success: boolean }>(`/api/debts/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();

