/// <reference types="vite/client" />

// allow overriding from Vite env so we can run the frontend on any port
// without having to edit source; the default is the backend port used in
// development.
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8080/api";

// ========================================
// AUTH TYPES & FUNCTIONS
// ========================================

export interface LoginResult {
  token: string;
  email: string;
  role: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Login failed");
    }

    const data = (await response.json()) as LoginResult;

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authEmail", data.email);
    localStorage.setItem("authRole", data.role);

    return data;
  } catch (err) {
    console.error("login request failed", err);
    throw err;
  }
}

export async function registerCandidate(
  fullName: string,
  email: string,
  password: string,
  role: string = "CANDIDAT"
) {
  const [prenom, ...rest] = fullName.trim().split(" ");
  const nom = rest.join(" ") || prenom;

  const body = {
    nom,
    prenom,
    email,
    password,
    role: role,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Register failed");
    }
  } catch (err) {
    console.error("register request failed", err);
    throw err;
  }
}

// ========================================
// USER PROFILE
// ========================================

export interface UserProfile {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  fullName: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return await response.json();
  } catch (err) {
    console.error("getMyProfile failed", err);
    throw err;
  }
}

// ========================================
// CV TYPES & FUNCTIONS
// ========================================

export interface CVDTO {
  id: number;
  nomFichier: string;
  cheminFichier: string;
  texteExtrait: string | null;
  candidat: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  offre: {
    id: number;
    titre: string;
  };
  uploadedAt: string;
}

export async function uploadCv(file: File, offreId: number): Promise<string> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in to upload a CV.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("offreId", offreId.toString());

  try {
    const response = await fetch(`${API_BASE_URL}/cv/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      console.error("cv upload response", response.status, message);
      throw new Error(message || "CV upload failed");
    }

    return await response.text();
  } catch (err) {
    console.error("cv upload failed", err);
    throw err;
  }
}

export async function getCVsByOffre(offreId: number): Promise<CVDTO[]> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cv/offre/${offreId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CVs");
    }

    return await response.json();
  } catch (err) {
    console.error("getCVsByOffre failed", err);
    throw err;
  }
}

export async function getMesCVs(): Promise<CVDTO[]> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cv/mes-cvs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch my CVs");
    }

    return await response.json();
  } catch (err) {
    console.error("getMesCVs failed", err);
    throw err;
  }
}

// ========================================
// OFFRES TYPES & FUNCTIONS
// ========================================

export interface OffreDTO {
  id: number;
  titre: string;
  description: string;
  localisation: string;
  typeContrat: string;
  competencesRequises: string;
  active: boolean;
  createdAt: string;
}

export async function getMesOffres(): Promise<OffreDTO[]> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/offres/mes-offres`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch offres");
    }

    return await response.json();
  } catch (err) {
    console.error("getMesOffres failed", err);
    throw err;
  }
}

export async function getAllOffres(): Promise<OffreDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/offres`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch offres");
    }

    return await response.json();
  } catch (err) {
    console.error("getAllOffres failed", err);
    throw err;
  }
}

export async function deleteOffre(offreId: number): Promise<void> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/offres/${offreId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete offre");
    }
  } catch (err) {
    console.error("deleteOffre failed", err);
    throw err;
  }
}

export async function createOffre(offre: Omit<OffreDTO, 'id' | 'active' | 'createdAt'>): Promise<OffreDTO> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("You must be logged in");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/offres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offre),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to create offre");
    }

    return await response.json();
  } catch (err) {
    console.error("createOffre failed", err);
    throw err;
  }
}