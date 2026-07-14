import axios from "axios";
import { store } from "./storage";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = {
  async registerUpgrade(name, email) {
    const { data } = await axios.post(`${API}/upgrade/register`, {
      name, email, device_id: store.deviceId,
    });
    return data;
  },
  async submitScore(payload) {
    const { data } = await axios.post(`${API}/scores/submit`, {
      device_id: store.deviceId,
      ...payload,
    });
    return data;
  },
  async leaderboard(theme, difficulty) {
    const { data } = await axios.get(`${API}/scores/leaderboard`, {
      params: { theme, difficulty, limit: 20 },
    });
    return data;
  },
};

export function formatApiError(e) {
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(" ");
  return e?.message || "Something went wrong";
}
