"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Property, PropertyStatus } from "@/lib/types";

type FormState = {
  title: string;
  city: string;
  address: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  type: string;
  status: PropertyStatus;
  description: string;
  featuresText: string;
  imageUrls: string[];
  pendingImageUrl: string;
};

const defaultForm: FormState = {
  title: "",
  city: "",
  address: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  type: "",
  status: "For Sale",
  description: "",
  featuresText: "",
  imageUrls: [],
  pendingImageUrl: ""
};

function featuresToText(features: string[]): string {
  return features.join("\n");
}

function parseFeatures(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapPropertyToForm(property: Property): FormState {
  return {
    title: property.title,
    city: property.city,
    address: property.address,
    price: String(property.price),
    beds: String(property.beds),
    baths: String(property.baths),
    sqft: String(property.sqft),
    type: property.type,
    status: property.status,
    description: property.description,
    featuresText: featuresToText(property.features),
    imageUrls: [...property.images],
    pendingImageUrl: ""
  };
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function refreshProperties(): Promise<void> {
    setLoadingProperties(true);

    try {
      const response = await fetch("/api/properties", { cache: "no-store" });
      const data = (await response.json()) as { properties: Property[]; error?: string };

      if (!response.ok || !Array.isArray(data.properties)) {
        throw new Error(data.error ?? "Could not load properties.");
      }

      setProperties(data.properties);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load properties.";
      setError(message);
    } finally {
      setLoadingProperties(false);
    }
  }

  useEffect(() => {
    async function init(): Promise<void> {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await response.json()) as { authenticated: boolean; totpEnabled: boolean };
        setAuthenticated(Boolean(data.authenticated));
        setTotpEnabled(Boolean(data.totpEnabled));
      } catch {
        setAuthenticated(false);
        setTotpEnabled(false);
      } finally {
        setLoadingSession(false);
      }
    }

    void init();
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    void refreshProperties();
  }, [authenticated]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAuthError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, code: totpCode })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setAuthError(data.error ?? "Login failed.");
      return;
    }

    setPassword("");
    setTotpCode("");
    setQrImageUrl("");
    setQrError("");
    setAuthenticated(true);
  }

  async function handleGenerateQr(): Promise<void> {
    setQrError("");
    setAuthError("");

    if (!totpEnabled) {
      setQrError("2FA is not enabled on this environment.");
      return;
    }

    if (!password.trim()) {
      setQrError("Enter your admin password first.");
      return;
    }

    setQrLoading(true);

    try {
      const response = await fetch("/api/admin/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = (await response.json()) as { uri?: string; error?: string };

      if (!response.ok || !data.uri) {
        throw new Error(data.error ?? "Could not generate QR code.");
      }

      const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data.uri)}`;
      setQrImageUrl(qrSource);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate QR code.";
      setQrError(message);
      setQrImageUrl("");
    } finally {
      setQrLoading(false);
    }
  }

  async function handleLogout(): Promise<void> {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setEditingId(null);
    setForm(defaultForm);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const nextUrls: string[] = [];

      for (const file of Array.from(event.target.files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "Failed to upload one of the selected images.");
        }

        nextUrls.push(data.url);
      }

      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...nextUrls] }));
      setFeedback(`Uploaded ${nextUrls.length} image${nextUrls.length > 1 ? "s" : ""}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
    } finally {
      event.target.value = "";
      setUploading(false);
    }
  }

  function addImageByUrl(): void {
    const value = form.pendingImageUrl.trim();

    if (!value) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, value],
      pendingImageUrl: ""
    }));
  }

  function removeImage(index: number): void {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, current) => current !== index)
    }));
  }

  function resetForm(clearMessages = true): void {
    setEditingId(null);
    setForm(defaultForm);

    if (clearMessages) {
      setError("");
      setFeedback("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const payload = {
        title: form.title,
        city: form.city,
        address: form.address,
        price: Number(form.price),
        beds: Number(form.beds),
        baths: Number(form.baths),
        sqft: Number(form.sqft),
        type: form.type,
        status: form.status,
        description: form.description,
        features: parseFeatures(form.featuresText),
        images: form.imageUrls
      };

      const endpoint = isEditing ? `/api/properties/${editingId}` : "/api/properties";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save property.");
      }

      setFeedback(isEditing ? "Property updated successfully." : "Property created successfully.");
      resetForm(false);
      await refreshProperties();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save property.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const confirmed = window.confirm("Delete this listing?");

    if (!confirmed) {
      return;
    }

    setError("");
    setFeedback("");

    const response = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not delete property.");
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    setFeedback("Property deleted.");
    await refreshProperties();
  }

  function startEdit(property: Property): void {
    setEditingId(property.id);
    setForm(mapPropertyToForm(property));
    setError("");
    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loadingSession) {
    return <main className="admin-shell loading-state">Loading portal...</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell">
        <section className="admin-login-card">
          <p className="kicker">Admin Portal</p>
          <h1>Secure Listing Manager</h1>
          <p>Log in to publish, update, and remove homes including photos and listing information.</p>
          {totpEnabled ? <p className="muted">2FA is enabled for this portal.</p> : null}

          <form onSubmit={handleLogin} className="admin-login-form">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setQrImageUrl("");
                  setQrError("");
                }}
                placeholder="Enter admin password"
                required
              />
            </label>

            {totpEnabled ? (
              <label>
                Authenticator code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  required
                />
              </label>
            ) : null}

            {totpEnabled ? (
              <div className="qr-setup-area">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void handleGenerateQr()}
                  disabled={qrLoading}
                >
                  {qrLoading ? "Generating QR..." : "Generate Authenticator QR"}
                </button>

                {qrImageUrl ? (
                  <div className="totp-qr-card">
                    <img src={qrImageUrl} alt="Authenticator app setup QR code" className="totp-qr" />
                    <p className="muted">Scan this with Google Authenticator, Authy, or 1Password.</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary">
              Log in
            </button>
          </form>

          {authError ? <p className="form-error">{authError}</p> : null}
          {qrError ? <p className="form-error">{qrError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-header">
        <div>
          <p className="kicker">Admin Portal</p>
          <h1>Property Management</h1>
        </div>

        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </section>

      <section className="admin-layout">
        <article className="admin-card">
          <h2>{isEditing ? "Edit Listing" : "New Listing"}</h2>

          <form onSubmit={handleSubmit} className="admin-form">
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Property title"
                required
              />
            </label>

            <div className="admin-grid-2">
              <label>
                City
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="e.g. Port Charlotte"
                  required
                />
              </label>

              <label>
                Type
                <input
                  type="text"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  placeholder="e.g. Single Family"
                  required
                />
              </label>
            </div>

            <label>
              Address
              <input
                type="text"
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Full property address"
                required
              />
            </label>

            <div className="admin-grid-4">
              <label>
                Price (USD)
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="0"
                  required
                />
              </label>

              <label>
                Beds
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.beds}
                  onChange={(event) => setForm((prev) => ({ ...prev, beds: event.target.value }))}
                  placeholder="0"
                  required
                />
              </label>

              <label>
                Baths
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.baths}
                  onChange={(event) => setForm((prev) => ({ ...prev, baths: event.target.value }))}
                  placeholder="0"
                  required
                />
              </label>

              <label>
                Sqft
                <input
                  type="number"
                  min="0"
                  value={form.sqft}
                  onChange={(event) => setForm((prev) => ({ ...prev, sqft: event.target.value }))}
                  placeholder="0"
                  required
                />
              </label>
            </div>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as PropertyStatus }))
                }
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Sold">Sold</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe the property..."
                required
              />
            </label>

            <label>
              Features (one per line)
              <textarea
                rows={4}
                value={form.featuresText}
                onChange={(event) => setForm((prev) => ({ ...prev, featuresText: event.target.value }))}
                placeholder="New impact-rated windows&#10;Large primary suite&#10;Energy-efficient appliances"
              />
            </label>

            <div className="image-management">
              <p className="field-label">Listing images</p>

              <div className="admin-inline-controls">
                <input type="file" accept="image/*" multiple onChange={handleUpload} />
              </div>

              <div className="admin-inline-controls">
                <input
                  type="url"
                  value={form.pendingImageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, pendingImageUrl: event.target.value }))}
                  placeholder="https://..."
                />
                <button type="button" className="btn btn-secondary" onClick={addImageByUrl}>
                  Add URL
                </button>
              </div>

              {form.imageUrls.length === 0 ? (
                <p className="muted">Add at least one image.</p>
              ) : (
                <div className="image-list">
                  {form.imageUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="image-list-item">
                      <img src={url} alt="Property preview" />
                      <div>
                        <p className="truncate">{url}</p>
                        <button type="button" className="inline-link danger" onClick={() => removeImage(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                {saving ? "Saving..." : isEditing ? "Update listing" : "Create listing"}
              </button>

              {isEditing ? (
                <button type="button" className="btn btn-secondary" onClick={() => resetForm()}>
                  Cancel edit
                </button>
              ) : null}
            </div>

            {uploading ? <p className="muted">Uploading images...</p> : null}
            {feedback ? <p className="form-success">{feedback}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>

        <aside className="admin-card">
          <h2>Current Listings</h2>

          {loadingProperties ? (
            <p className="muted">Loading listings...</p>
          ) : properties.length === 0 ? (
            <p className="muted">No listings yet.</p>
          ) : (
            <div className="admin-listings">
              {properties.map((property) => (
                <article key={property.id} className="admin-listing-card">
                  <img src={property.images[0]} alt={property.title} />
                  <div>
                    <h3>{property.title}</h3>
                    <p>{property.address}</p>
                    <p>
                      {property.status} &bull; ${property.price.toLocaleString()}
                    </p>
                    <div className="admin-listing-actions">
                      <button type="button" className="inline-link" onClick={() => startEdit(property)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-link danger"
                        onClick={() => void handleDelete(property.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
