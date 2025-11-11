// Called from index.html body onload
async function bootstrap(){
  await loadApi();               // inject api.html
  const games = await nextGames();
  const next = games[0];         // Thursday or closest
  renderNext(next);
}

function loadApi(){
  return new Promise(res=>{
    const f = document.createElement('iframe');
    f.style.display='none';
    f.src='api.html';
    f.onload = ()=>{ document.body.appendChild(f); res(); };
  });
}

async function nextGames(){
  const raw = await API.odds('/v4/sports/americanfootball_nfl/events');
  const upcoming = raw.filter(e=>new Date(e.commence_time) <= new Date(Date.now()+7*24*60*60*1000));
  upcoming.sort((a,b)=>new Date(a.commence_time)-new Date(b.commence_time));
  return upcoming;
}

async function renderNext(game){
  const card = document.getElementById('gameCard');
  card.innerHTML = `
    <h2>${game.home_team} vs ${game.away_team}</h2>
    <p>Date: ${new Date(game.commence_time).toLocaleString()}</p>
    <p>Stadium: <span id="venue">loading…</span></p>
    <ol id="top5"></ol>
  `;
  // Venue lookup via api-football (skeleton – returns first match)
  const venue = await getVenue(game.home_team);
  document.getElementById('venue').textContent = venue||'TBD';

  // Top-5 props
  const top5 = await computeTop5(game.id);
  const list = document.getElementById('top5');
  top5.forEach(p=>{
    const li = document.createElement('li');
    li.textContent = `${p.player} – ${p.market} ${p.line} (${p.edge>0?'+':''}${(p.edge*100).toFixed(1)}% edge)`;
    list.appendChild(li);
  });
}

/* ---------- stubs ---------- */
async function getVenue(teamName){ return 'Stadium TBD'; }

async function computeTop5(gameId){ return [{player:'Player A', market:'Receptions', line:'5.5', edge:0.07}]; }

}
