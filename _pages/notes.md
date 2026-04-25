---
layout: archive
permalink: /notes/
title: "Notes"
author_profile: true
---

Short-form notes, study logs, and working references.

{% include base_path %}
{% assign notes = site.notes | sort: "date" | reverse %}

{% if notes.size > 0 %}
  {% for post in notes %}
    {% include archive-single.html %}
  {% endfor %}
{% else %}
  <p>No notes yet.</p>
{% endif %}
