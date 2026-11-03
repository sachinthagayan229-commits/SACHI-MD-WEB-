
/* ==========================================
   SACHI-MD-WEB
   ADMIN PANEL + DYNAMIC API MANAGER
========================================== */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  if (
    !window.supabase ||
    !window.SACHI_SUPABASE_URL ||
    !window.SACHI_SUPABASE_KEY
  ) {
    alert("Supabase configuration is missing. Check config.js");
    return;
  }

  const db = window.supabase.createClient(
    window.SACHI_SUPABASE_URL,
    window.SACHI_SUPABASE_KEY
  );

  const fields = [...document.querySelectorAll("[data-key]")];

  let apiItems = [];
  let deletedApiIds = [];
  let busy = false;

  const defaults = {
    siteName: "SACHINTHA",
    profileTitle: "Creator · Tech Enthusiast",
    bio: "I'm Sachintha.",
    profileImage: "",
    welcomeText: "Welcome to SACHI-MD-WEB",
    whatsappNumber: "94778936490",
    whatsappMessage: "Hi Sachintha! I found your website.",
    whatsappGroup: "https://chat.whatsapp.com/KHLoN4Chzag2YPvehbmjm8",
    instagram: "https://www.instagram.com/sachintha5275",
    tiktok: "https://www.tiktok.com/@sachinthagayan915",
    facebook: "https://www.facebook.com/share/1KR7Xbrjcn/",
    showAbout: "true",
    showTools: "true",
    showContact: "true"
  };

  function message(id, text) {
    const element = $(id);
    if (element) element.textContent = text;
  }

  function setBusy(value) {
    busy = value;

    [
      "login",
      "save",
      "add-api",
      "reload",
      "check-backend"
    ].forEach(id => {
      if ($(id)) $(id).disabled = value;
    });
  }

  function escapeValue(value) {
    return String(value ?? "");
  }

  // ========================================
  // ADMIN AUTHORIZATION
  // ========================================

  async function isAdmin(user) {
    const { data, error } = await db
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return false;
    }

    return Boolean(data);
  }

  async function showPanel(user) {
    message("login-status", "Checking admin permission...");

    const allowed = await isAdmin(user);

    if (!allowed) {
      await db.auth.signOut();

      $("panel").classList.add("hidden");
      $("login-card").classList.remove("hidden");

      message(
        "login-status",
        "This account is not registered as an admin."
      );

      return;
    }

    $("login-card").classList.add("hidden");
    $("panel").classList.remove("hidden");

    await loadSettings();
    await loadApis();

    message("login-status", "");
  }

  // ========================================
  // LOGIN
  // ========================================

  $("login").addEventListener("click", async () => {
    if (busy) return;

    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      message("login-status", "Enter email and password.");
      return;
    }

    setBusy(true);
    message("login-status", "Signing in...");

    try {
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      await showPanel(data.user);

    } catch (error) {
      message("login-status", error.message);
    } finally {
      setBusy(false);
    }
  });

  // ========================================
  // LOAD WEBSITE SETTINGS
  // ========================================

  async function loadSettings() {
    message("save-status", "Loading website settings...");

    const { data, error } = await db
      .from("site_settings")
      .select("key,value");

    if (error) {
      message("save-status", error.message);
      return;
    }

    const settings = { ...defaults };

    (data || []).forEach(row => {
      settings[row.key] = row.value;
    });

    fields.forEach(field => {
      const key = field.dataset.key;
      const value = settings[key];

      field.value = value == null
        ? ""
        : String(value);
    });

    message("save-status", "Website settings loaded.");
  }

  // ========================================
  // SAVE WEBSITE SETTINGS
  // ========================================

  $("save").addEventListener("click", async () => {
    if (busy) return;

    setBusy(true);
    message("save-status", "Saving website settings...");

    try {
      const rows = fields.map(field => ({
        key: field.dataset.key,
        value: field.value
      }));

      const { error } = await db
        .from("site_settings")
        .upsert(rows, {
          onConflict: "key"
        });

      if (error) throw error;

      message(
        "save-status",
        "Settings saved successfully. Refresh your homepage."
      );

    } catch (error) {
      message("save-status", "Save failed: " + error.message);
    } finally {
      setBusy(false);
    }
  });

  // ========================================
  // DYNAMIC API MANAGER
  // ========================================

  async function loadApis() {
    message("api-status", "Loading API providers...");

    const { data, error } = await db
      .from("api_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      message("api-status", "API loading failed: " + error.message);
      return;
    }

    apiItems = data || [];
    deletedApiIds = [];

    renderApis();

    message(
      "api-status",
      apiItems.length + " API provider(s) loaded."
    );
  }

  function createField(labelText, property, value, type = "text") {
    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const label = document.createElement("label");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = type;
    input.value = escapeValue(value);
    input.dataset.property = property;

    wrapper.append(label, input);

    return { wrapper, input };
  }

  function renderApis() {
    const host = $("api-list");

    host.replaceChildren();

    if (!apiItems.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No API providers added yet.";
      host.appendChild(empty);
      return;
    }

    apiItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "api-item";

      const heading = document.createElement("h3");
      heading.textContent = item.name || "New API Provider";

      const name = createField(
        "API Name",
        "name",
        item.name
      );

      const providerKey = createField(
        "Provider Identifier",
        "provider_key",
        item.provider_key
      );

      const base = createField(
        "Base URL",
        "base_url",
        item.base_url,
        "url"
      );

      const docs = createField(
        "Documentation URL",
        "docs_url",
        item.docs_url,
        "url"
      );

      const secret = createField(
        "Secret Name (not the secret value)",
        "secret_name",
        item.secret_name
      );

      const enabledWrap = document.createElement("div");
      enabledWrap.className = "field";

      const enabledLabel = document.createElement("label");
      enabledLabel.textContent = "Provider Status";

      const enabled = document.createElement("select");

      const activeOption = document.createElement("option");
      activeOption.value = "true";
      activeOption.textContent = "Enabled";

      const inactiveOption = document.createElement("option");
      inactiveOption.value = "false";
      inactiveOption.textContent = "Disabled";

      enabled.append(activeOption, inactiveOption);
      enabled.value = String(Boolean(item.enabled));

      enabledWrap.append(enabledLabel, enabled);

      const actions = document.createElement("div");
      actions.className = "api-actions";

      const deleteButton = document.createElement("button");
      deleteButton.className = "admin-btn danger";
      deleteButton.type = "button";
      deleteButton.textContent = "Delete API";

      [
        name,
        providerKey,
        base,
        docs,
        secret
      ].forEach(field => {
        field.input.addEventListener("input", () => {
          item[field.input.dataset.property] =
            field.input.value;

          heading.textContent =
            item.name || "New API Provider";
        });
      });

      enabled.addEventListener("change", () => {
        item.enabled = enabled.value === "true";
      });

      deleteButton.addEventListener("click", () => {
        if (
          item.id &&
          !deletedApiIds.includes(item.id)
        ) {
          deletedApiIds.push(item.id);
        }

        apiItems.splice(index, 1);
        renderApis();

        message(
          "api-status",
          "API marked for deletion. Click Save API Changes."
        );
      });

      actions.appendChild(deleteButton);

      card.append(
        heading,
        name.wrapper,
        providerKey.wrapper,
        base.wrapper,
        docs.wrapper,
        secret.wrapper,
        enabledWrap,
        actions
      );

      host.appendChild(card);
    });
  }

  // ADD API
  $("add-api").addEventListener("click", () => {
    apiItems.unshift({
      id: null,
      name: "",
      provider_key: "",
      base_url: "",
      docs_url: "",
      secret_name: "",
      enabled: false
    });

    renderApis();

    message("api-status", "New API added. Complete its details and save.");
  });

  // ========================================
  // SAVE API PROVIDERS
  // ========================================

  const saveApiButton = document.createElement("button");

  saveApiButton.type = "button";
  saveApiButton.className = "admin-btn";
  saveApiButton.textContent = "Save API Changes";

  $("api-list").parentElement.appendChild(saveApiButton);

  saveApiButton.addEventListener("click", async () => {
    if (busy) return;

    setBusy(true);
    saveApiButton.disabled = true;

    message("api-status", "Saving API providers...");

    try {
      // Validate entries
      for (const item of apiItems) {
        if (!item.name.trim()) {
          throw new Error("Every API needs a name.");
        }

        if (!item.base_url.trim()) {
          throw new Error("Every API needs a Base URL.");
        }

        let parsed;

        try {
          parsed = new URL(item.base_url);
        } catch {
          throw new Error("Invalid API Base URL: " + item.name);
        }

        if (
          parsed.protocol !== "https:" &&
          parsed.hostname !== "localhost"
        ) {
          throw new Error("API Base URL must use HTTPS.");
        }

        if (
          item.docs_url &&
          !/^https:\/\//i.test(item.docs_url)
        ) {
          throw new Error("Documentation URL must use HTTPS.");
        }
      }

      // Delete removed providers
      if (deletedApiIds.length) {
        const { error } = await db
          .from("api_providers")
          .delete()
          .in("id", deletedApiIds);

        if (error) throw error;
      }

      // Save remaining providers
      if (apiItems.length) {
        const rows = apiItems.map(item => {
          const row = {
            name: item.name.trim(),
            provider_key: item.provider_key.trim() || null,
            base_url: item.base_url.trim(),
            docs_url: item.docs_url.trim() || null,
            secret_name: item.secret_name.trim() || null,
            enabled: Boolean(item.enabled),
            updated_at: new Date().toISOString()
          };

          if (item.id) row.id = item.id;

          return row;
        });

        const { error } = await db
          .from("api_providers")
          .upsert(rows, {
            onConflict: "id"
          });

        if (error) throw error;
      }

      await loadApis();

      message("api-status", "API providers saved successfully.");

    } catch (error) {
      message("api-status", "API save failed: " + error.message);
    } finally {
      setBusy(false);
      saveApiButton.disabled = false;
    }
  });

  // ========================================
  // BACKEND STATUS
  // ========================================

  $("check-backend").addEventListener("click", async () => {
    const output = $("backend-status");

    output.textContent = "Checking secure backend...";

    try {
      const { data, error } = await db.functions.invoke(
        "super-action",
        {
          body: {
            action: "status"
          }
        }
      );

      if (error) throw error;

      if (data && data.status === "ok") {
        output.textContent =
          "Backend online · Admin authorization verified.";
      } else {
        output.textContent =
          "Backend replied, but status was unexpected.";
      }

    } catch (error) {
      output.textContent =
        "Backend unavailable: " + error.message;
    }
  });

  // ========================================
  // RELOAD
  // ========================================

  $("reload").addEventListener("click", async () => {
    if (busy) return;

    setBusy(true);

    try {
      await loadSettings();
      await loadApis();
    } finally {
      setBusy(false);
    }
  });

  // ========================================
  // LOGOUT
  // ========================================

  $("logout").addEventListener("click", async () => {
    await db.auth.signOut();

    $("panel").classList.add("hidden");
    $("login-card").classList.remove("hidden");

    $("password").value = "";

    message("login-status", "Logged out successfully.");
  });

  // ========================================
  // RESTORE SESSION
  // ========================================

  async function start() {
    const { data, error } = await db.auth.getSession();

    if (error) {
      message("login-status", error.message);
      return;
    }

    if (data.session) {
      await showPanel(data.session.user);
    }
  }

  start();

})();
