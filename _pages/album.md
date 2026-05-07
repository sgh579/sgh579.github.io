---
layout: single
permalink: /album/
title: "Album"
author_profile: true
---

<p class="album-intro">Photos and visual records.</p>

{% assign album_images = site.static_files | where_exp: "f", "f.path contains '/images/album/'" %}

{% assign sub_files = "" | split: "" %}
{% assign loose_files = "" | split: "" %}
{% for f in album_images %}
  {% assign tail = f.path | remove_first: '/images/album/' %}
  {% if tail contains '/' %}
    {% assign sub_files = sub_files | push: f %}
  {% else %}
    {% assign loose_files = loose_files | push: f %}
  {% endif %}
{% endfor %}

{% assign grouped = sub_files | group_by_exp: "f", "f.path | remove_first: '/images/album/' | split: '/' | first" | sort: "name" %}

{% if grouped.size == 0 and loose_files.size == 0 %}
<p><em>No photos yet — drop images into <code>images/album/&lt;folder&gt;/</code>.</em></p>
{% else %}

<div class="album-layout">
  <aside class="album-tabs" role="tablist" aria-label="Album categories">
    {% for g in grouped %}
      <button type="button"
              role="tab"
              class="album-tab{% if forloop.first %} is-active{% endif %}"
              data-tab="g-{{ forloop.index }}"
              aria-selected="{% if forloop.first %}true{% else %}false{% endif %}">
        <span class="album-tab__name">{{ g.name }}</span>
        <span class="album-tab__count">{{ g.items.size }}</span>
      </button>
    {% endfor %}
    {% if loose_files.size > 0 %}
      <button type="button"
              role="tab"
              class="album-tab{% if grouped.size == 0 %} is-active{% endif %}"
              data-tab="g-loose"
              aria-selected="{% if grouped.size == 0 %}true{% else %}false{% endif %}">
        <span class="album-tab__name">其他</span>
        <span class="album-tab__count">{{ loose_files.size }}</span>
      </button>
    {% endif %}
  </aside>

  <div class="album-panels">
    {% for g in grouped %}
      <section class="album-panel{% if forloop.first %} is-active{% endif %}"
               role="tabpanel"
               data-panel="g-{{ forloop.index }}">

        {% comment %} Split this tab's files: those nested in sub-sections vs. loose-in-tab {% endcomment %}
        {% assign tab_subs = "" | split: "" %}
        {% assign tab_loose = "" | split: "" %}
        {% for f in g.items %}
          {% assign rel_parts = f.path | remove_first: '/images/album/' | split: '/' %}
          {% if rel_parts.size > 2 %}
            {% assign tab_subs = tab_subs | push: f %}
          {% else %}
            {% assign tab_loose = tab_loose | push: f %}
          {% endif %}
        {% endfor %}
        {% assign subgrouped = tab_subs | group_by_exp: "f", "f.path | remove_first: '/images/album/' | split: '/' | slice: 1, 1 | first" | sort: "name" %}

        {% if tab_loose.size > 0 %}
          <div class="album-grid">
            {% for img in tab_loose %}
              {% assign filename = img.name | split: '.' | first %}
              <figure class="album-card" data-full="{{ img.path | relative_url }}" data-caption="{{ filename }}">
                <img src="{{ img.path | relative_url }}" alt="{{ filename }}" loading="lazy">
                <figcaption>{{ filename }}</figcaption>
              </figure>
            {% endfor %}
          </div>
        {% endif %}

        {% for sub in subgrouped %}
          <h3 class="album-section-title">
            <span class="album-section-name">{{ sub.name }}</span>
            <span class="album-section-count">{{ sub.items.size }}</span>
          </h3>
          <div class="album-grid">
            {% for img in sub.items %}
              {% assign filename = img.name | split: '.' | first %}
              <figure class="album-card" data-full="{{ img.path | relative_url }}" data-caption="{{ filename }}">
                <img src="{{ img.path | relative_url }}" alt="{{ filename }}" loading="lazy">
                <figcaption>{{ filename }}</figcaption>
              </figure>
            {% endfor %}
          </div>
        {% endfor %}
      </section>
    {% endfor %}

    {% if loose_files.size > 0 %}
      <section class="album-panel{% if grouped.size == 0 %} is-active{% endif %}"
               role="tabpanel"
               data-panel="g-loose">
        <div class="album-grid">
          {% for img in loose_files %}
            {% assign filename = img.name | split: '.' | first %}
            <figure class="album-card" data-full="{{ img.path | relative_url }}" data-caption="{{ filename }}">
              <img src="{{ img.path | relative_url }}" alt="{{ filename }}" loading="lazy">
              <figcaption>{{ filename }}</figcaption>
            </figure>
          {% endfor %}
        </div>
      </section>
    {% endif %}
  </div>
</div>

{% endif %}

<div class="album-lightbox" id="albumLightbox" aria-hidden="true">
  <button class="album-lightbox__close" aria-label="Close">&times;</button>
  <img class="album-lightbox__img" alt="">
  <div class="album-lightbox__caption"></div>
</div>

<style>
.album-intro {
  color: #6b7280;
  margin-bottom: 1.75rem;
  font-size: 0.95rem;
}

/* ---------- Layout ---------- */
.album-layout {
  display: flex;
  gap: 1.75rem;
  align-items: flex-start;
}

.album-panels {
  flex: 1;
  min-width: 0;
}

/* ---------- Tabs (sticky left rail) ---------- */
.album-tabs {
  position: sticky;
  top: 1.25rem;
  align-self: flex-start;
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-right: 1px solid #eee;
}

.album-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.8rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #4b5563;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
  border-left: 3px solid transparent;
  margin-left: -3px;
}

.album-tab:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #111827;
}

.album-tab.is-active {
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border-left-color: #2563eb;
  font-weight: 600;
}

.album-tab__count {
  font-size: 0.72rem;
  font-weight: 500;
  color: #9ca3af;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  min-width: 1.5rem;
  text-align: center;
}

.album-tab.is-active .album-tab__count {
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.15);
}

/* ---------- Panels ---------- */
.album-panel {
  display: none;
  animation: albumPanelIn 0.28s ease;
}
.album-panel.is-active {
  display: block;
}

@keyframes albumPanelIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- Section headings (sub-groups inside a tab) ---------- */
.album-section-title {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  margin: 1.75rem 0 0.85rem;
  padding-bottom: 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.01em;
  border-bottom: 1px solid #e5e7eb;
}

.album-panel > .album-section-title:first-child,
.album-panel > .album-grid:first-child + .album-section-title {
  margin-top: 0.5rem;
}

.album-section-name::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 0.95em;
  background: #2563eb;
  border-radius: 2px;
  margin-right: 0.55rem;
  transform: translateY(2px);
}

.album-section-count {
  font-size: 0.78rem;
  font-weight: 500;
  color: #9ca3af;
  background: rgba(0, 0, 0, 0.04);
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
}

/* ---------- Masonry grid ---------- */
.album-grid {
  column-count: 3;
  column-gap: 0.85rem;
  margin: 0;
}

@media (max-width: 1100px) {
  .album-grid { column-count: 2; }
}

@media (max-width: 560px) {
  .album-grid { column-count: 1; }
}

.album-card {
  break-inside: avoid;
  margin: 0 0 0.85rem;
  padding: 0;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: zoom-in;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.album-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.album-card img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.5s ease;
}

.album-card:hover img {
  transform: scale(1.04);
}

.album-card figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1.4rem 0.85rem 0.65rem;
  color: #fff;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0));
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  pointer-events: none;
}

.album-card:hover figcaption {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- Mobile: tabs become horizontal strip ---------- */
@media (max-width: 700px) {
  .album-layout {
    flex-direction: column;
    gap: 1rem;
  }
  .album-tabs {
    position: static;
    flex: 0 0 auto;
    flex-direction: row;
    overflow-x: auto;
    padding: 0 0 0.5rem;
    border-right: none;
    border-bottom: 1px solid #eee;
    gap: 0.4rem;
  }
  .album-tab {
    border-left: none;
    border-bottom: 3px solid transparent;
    margin-left: 0;
    margin-bottom: -1px;
    white-space: nowrap;
  }
  .album-tab.is-active {
    border-left-color: transparent;
    border-bottom-color: #2563eb;
    background: transparent;
  }
}

/* ---------- Lightbox ---------- */
.album-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 18, 0.92);
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 9999;
  padding: 2rem;
  animation: albumFade 0.25s ease;
}
.album-lightbox.is-open { display: flex; }

@keyframes albumFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.album-lightbox__img {
  max-width: 92vw;
  max-height: 82vh;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.album-lightbox__caption {
  color: #e5e7eb;
  margin-top: 1rem;
  font-size: 0.9rem;
  letter-spacing: 0.03em;
}

.album-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2.4rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.album-lightbox__close:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>

<script>
(function () {
  /* Tab switching */
  var tabs = document.querySelectorAll('.album-tab');
  var panels = document.querySelectorAll('.album-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.tab;
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.querySelector('[data-panel="' + target + '"]');
      if (panel) panel.classList.add('is-active');
    });
  });

  /* Lightbox */
  var lightbox = document.getElementById('albumLightbox');
  if (!lightbox) return;
  var lbImg = lightbox.querySelector('.album-lightbox__img');
  var lbCap = lightbox.querySelector('.album-lightbox__caption');
  var lbClose = lightbox.querySelector('.album-lightbox__close');

  function open(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || '';
    lbCap.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.album-card').forEach(function (card) {
    card.addEventListener('click', function () {
      open(card.dataset.full, card.dataset.caption);
    });
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
</script>
