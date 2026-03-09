// services/adminService.js
import { supabase } from '../lib/supabase';

class AdminService {
  // ─── USERS ───────────────────────────────────────────────────────────────────
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async updateUserStatus(userId, status) {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  }

  // ─── VALUATIONS ──────────────────────────────────────────────────────────────
  async getValuations() {
    const { data, error } = await supabase
      .from('valuations')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // ─── FEEDBACK ────────────────────────────────────────────────────────────────
  async getFeedbacks() {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*, users(name), valuations(property_address)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async updateRewardStatus(feedbackId, rewardStatus) {
    const { data, error } = await supabase
      .from('feedbacks')
      .update({ reward_status: rewardStatus })
      .eq('id', feedbackId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ─── STATS ───────────────────────────────────────────────────────────────────
  async getStats() {
    const [usersRes, valuationsRes, feedbacksRes] = await Promise.all([
      supabase.from('users').select('id, account_type, type, status'),
      supabase.from('valuations').select('id, valuation_amount'),
      supabase.from('feedbacks').select('id, rating'),
    ]);

    if (usersRes.error) throw usersRes.error;
    if (valuationsRes.error) throw valuationsRes.error;
    if (feedbacksRes.error) throw feedbacksRes.error;

    const users = usersRes.data;
    const valuations = valuationsRes.data;
    const feedbacks = feedbacksRes.data;

    return {
      totalUsers: users.length,
      paidUsers: users.filter(u => u.account_type === 'Paid').length,
      freeUsers: users.filter(u => u.account_type === 'Free').length,
      usersByType: {
        investor: users.filter(u => u.type === 'Investor').length,
        buyer:    users.filter(u => u.type === 'Buyer').length,
        seller:   users.filter(u => u.type === 'Seller').length,
        agent:    users.filter(u => u.type === 'Agent').length,
      },
      totalValuations: valuations.length,
      totalValuationValue: valuations.reduce((s, v) => s + (v.valuation_amount || 0), 0),
      totalFeedbacks: feedbacks.length,
      averageRating: feedbacks.length
        ? feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length
        : 0,
      totalSubscriptions: users.filter(u => u.account_type === 'Paid').length,
      totalArticles: 0, // wire to your articles table if needed
    };
  }
}

export const adminService = new AdminService();
