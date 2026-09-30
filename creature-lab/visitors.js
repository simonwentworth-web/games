/*
 * Unique-visitor store used by server.js.
 *
 * Each browser sends a random visitor id (kept in its localStorage). The store
 * remembers a hash of that id and the visitor number it was given, so every
 * browser is counted once. Everything lives in one small JSON file.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ID_PATTERN = /^[A-Za-z0-9-]{16,64}$/;

function hashId(id) {
  return crypto.createHash('sha256').update(id).digest('hex').slice(0, 32);
}

function createVisitorStore(file) {
  let visitors = {};
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data && data.visitors && typeof data.visitors === 'object') visitors = data.visitors;
  } catch (_) {
    // First run (or unreadable file): start counting from zero.
  }
  let total = Object.keys(visitors).length;
  let saveTimer = null;

  function save() {
    clearTimeout(saveTimer);
    saveTimer = null;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ total, visitors }));
    fs.renameSync(tmp, file);
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      try {
        save();
      } catch (err) {
        console.error('[visitors]', err.message);
      }
    }, 1000);
    saveTimer.unref();
  }

  return {
    total: () => total,
    isValidId: (id) => typeof id === 'string' && ID_PATTERN.test(id),
    has: (id) => Object.prototype.hasOwnProperty.call(visitors, hashId(id)),
    visit(id) {
      const key = hashId(id);
      if (visitors[key]) return { total, number: visitors[key], isNew: false };
      total += 1;
      visitors[key] = total;
      scheduleSave();
      return { total, number: total, isNew: true };
    },
    flush() {
      if (saveTimer) save();
    }
  };
}

module.exports = { createVisitorStore };
