document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('threat-list');
  const clearBtn = document.getElementById('btn-clear-history');

  function renderList() {
    chrome.storage.local.get(['threatHistory'], (res) => {
      const history = res.threatHistory || [];
      if (history.length === 0) {
        listEl.innerHTML = '<div style="color: #64748B; padding: 12px; text-align: center;">No active threats detected.</div>';
        return;
      }

      listEl.innerHTML = history.map(item => `
        <div class="history-item">
          <div>
            <div style="color: #F8FAFC; font-weight: 500;">${item.hostname}</div>
            <div style="color: #64748B; font-size: 10px;">${item.timestamp}</div>
          </div>
          <span>${item.riskLevel}</span>
        </div>
      `).join('');
    });
  }

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ threatHistory: [] }, () => {
      renderList();
    });
  });

  renderList();
});
