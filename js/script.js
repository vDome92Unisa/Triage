/*Simulazione di un triage ospedaliero utilizzando jQuery.
        L'operatore deve inserire i dati del paziente e ottenere una valutazione della gravità
        basata su specifici parametri clinici.
        La gravità sarà indicata con un colore: verde, giallo, rosso.
        Il modulo di accettazione deve essere composto da:
        - Nome
        - Cognome
        - Età
        - Temperatura
        - Frequenza cardiaca
        - Pressione sanguigna
        Dopo aver validato i dati inseriti e aver calcolato la gravità del paziente,
        quest'ultimo dovrà essere inserito in una lista dinamica formato tabella.
        Verde (non urgente): Parametri normali. 120/80
        Giallo (urgenza moderata): Febbre > 38.5°C, frequenza cardiaca > 100BPM, pressione > 140/100 || < 100/60 
        Rosso (urgenza elevata): Febbre > 39.5°C, frequenza cardiaca < 50BPM || > 200, pressione > 180/120 || < 80/40 
    */

        let valoriRandomInterval; // Variabile globale per l'intervallo
        let lampeggiaInterval; // Variabile globale per il lampeggio
        
        function OrdinamentoTabella() {
            let codice = { 'critico': 0, 'rosso': 1, 'giallo': 2, 'verde': 3 };
            let righe = $("#pazienti-body tr");
            righe.sort(function(a, b) {
                let codiceA = codice[$(a).attr('class').split(' ')[0]]; // Considera solo la prima classe
                let codiceB = codice[$(b).attr('class').split(' ')[0]]; // Considera solo la prima classe
                return codiceA - codiceB;
            });
            $("#pazienti-body").html(righe);
        }

        function Lampeggia(paziente) {
            let lampeggiaID = setInterval(function() {
                paziente.toggleClass('lampeggiante');
            }, 1000);
            paziente.data('lampeggiaID', lampeggiaID);
            console.log('primo log' + paziente.data('lampeggiaID'));
        }

        function ValoriRandom() {
            valoriRandomInterval = setInterval(function() {
                let pazienti = $("#pazienti-body tr");
                pazienti.each(function() {
                    let paziente = $(this);
                    let colore = paziente.attr('class');
                    let temperatura = parseFloat(paziente.children().eq(3).text());
                    let frequenza = parseInt(paziente.children().eq(4).text());
                    let saturazione = parseInt(paziente.children().eq(5).text());
                    let pressione = paziente.children().eq(6).text().split('/');
                    let pressionemax = parseInt(pressione[0]);
                    let pressionemin = parseInt(pressione[1]);
                    let random = Math.floor(Math.random() * 4);
        
                    // Modifica casuale dei valori
                    switch (random) {
                        case 0:
                            temperatura += Math.random() < 0.7 ? Math.random() * 0.5 : -Math.random() * 0.5;
                            break;
                        case 1:
                            frequenza += Math.random() < 0.7 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 5);
                            break;
                        case 2:
                            saturazione += Math.random() < 0.7 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 10);
                            break;
                        case 3:
                            pressionemax += Math.random() < 0.7 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 10);
                            pressionemin += Math.random() < 0.7 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 10);
                            break;
                    }
        
                    // Controllo dei limiti
                    temperatura = Math.min(Math.max(temperatura, 30), 45).toFixed(2);
                    frequenza = Math.min(Math.max(frequenza, 30), 200);
                    saturazione = Math.min(Math.max(saturazione, 80), 100);
                    pressionemax = Math.min(Math.max(pressionemax, 60), 200);
                    pressionemin = Math.min(Math.max(pressionemin, 50), 120);
        
                    // Determinazione del colore
                    let newColore = '';
                    if ((temperatura >= 39 || temperatura <= 35) || 
                        (frequenza >= 120 || frequenza <= 50) || 
                        (pressionemax > 140 || pressionemax < 90) || 
                        (pressionemin > 90 || pressionemin < 60) || 
                        saturazione < 60) {
                        newColore = 'rosso';
                    } else if ((temperatura > 38 && temperatura <= 38.9) || 
                               (frequenza >= 101 && frequenza <= 120) || 
                               (pressionemax >= 121 && pressionemax <= 140) || 
                               (pressionemin >= 81 && pressionemin <= 90) || 
                               (saturazione < 95 && saturazione >= 90)) {
                        newColore = 'giallo';
                    } else {
                        newColore = 'verde';
                    }
        
                    // Aggiornamento dei valori nella tabella
                    paziente.removeClass(colore).addClass(newColore);
                    paziente.children().eq(3).text(temperatura);
                    paziente.children().eq(4).text(frequenza);
                    paziente.children().eq(5).text(saturazione);
                    paziente.children().eq(6).text(`${pressionemax}/${pressionemin}`);
                    paziente.children().eq(7).text(newColore.toUpperCase());

                    if (temperatura >= 39 || temperatura <= 35 || frequenza >= 120 || frequenza <= 50 || pressionemax > 140 || pressionemax < 90 || pressionemin > 90 || pressionemin < 60 || saturazione < 60) {
                        alert('Il paziente ' + paziente.children().eq(0).text() + ' ' + paziente.children().eq(1).text() + ' ha un parametro critico: ' + 
                            (temperatura >= 39 || temperatura <= 35 ? 'Temperatura' : 
                             frequenza >= 120 || frequenza <= 50 ? 'Frequenza' : 
                             pressionemax > 140 || pressionemax < 90 ? 'Pressione massima' : 
                             pressionemin > 90 || pressionemin < 60 ? 'Pressione minima' : 'Saturazione'));
                        clearInterval(valoriRandomInterval); // Ferma il random
                        Lampeggia(paziente); // Lampeggia la riga
                        paziente.addClass('critico');
                        paziente.find('button.btn-primary').prop('disabled', false);
                        OrdinamentoTabella(); // Riordina la tabella immediatamente

                    // Aggiunta del bottone per paziente critico
                    if (!paziente.find('button.btn-primary').length) {
                        let button = $('<button class="btn btn-primary">Presa in carico</button>');
                        $(document).on('click', '.btn-primary', function() {
                            let button = $(this);
                            let paziente = button.closest('tr');
                        
                            if (button.prop('disabled')) return;
                        
                            alert('Il paziente ' + paziente.children().eq(0).text() + ' ' + paziente.children().eq(1).text() + ' è stato visionato');
                            
                            let lampeggiaID = paziente.data('lampeggiaID');
                            console.log('secondo log' + paziente.data('lampeggiaID'));
                            if (lampeggiaID) {
                                console.log('primo log' + paziente.data('lampeggiaID'));
                                clearInterval(lampeggiaID);
                                paziente.removeData('lampeggiaID');
                            }
                        
                            paziente.removeClass('critico lampeggiante');
                            paziente.children().eq(3).text(36.5);
                            paziente.children().eq(4).text(80);
                            paziente.children().eq(5).text(98);
                            paziente.children().eq(6).text('120/80');
                            paziente.children().eq(7).text('VERDE');
                            paziente.removeClass().addClass('verde');
                            button.prop('disabled', true);
                            button.remove();
                            OrdinamentoTabella();
                        });
                        paziente.append(button);
                    }
                }
            });
                OrdinamentoTabella();
                localStorage.setItem('pazienti', $("#pazienti-body").html());
            }, 5000);
        }
        
        

$(document).ready(function() {
    let pazienti = localStorage.getItem('pazienti');
    ValoriRandom();
    if(pazienti) {
        $("#pazienti-body").html(pazienti);
    }
    $('#form').on('submit', function(event) {
        event.preventDefault();

        let nome = $('#nome').val();
        let cognome = $('#cognome').val();
        let eta = $('#eta').val();
        let temperatura = $('#temperatura').val();
        let frequenza = $('#frequenza').val();
        let pressionemax = $('#pressionemax').val();
        let pressionemin = $('#pressionemin').val();
        let saturazione = $('#saturazione').val();
        
        if(!/^[a-zA-Z\s]+$/.test(nome) || !/^[a-zA-Z\s]+$/.test(cognome)) {
            alert('Nome e cognome possono contenere solo lettere'); return;
        } else if(!/^[0-9]+$/.test(eta)){
            alert('Età deve essere un numero'); return;
            } else if(eta < 0 || eta > 120) {
                alert('Età non valida min:0 max:120'); return;
        } else if(!/^[0-9\.]+$/.test(temperatura)){
            alert('Temperatura deve essere un numero'); return;
            } else if(temperatura < 30 || temperatura > 45) {
                alert('Temperatura non valida min:30 max:45'); return;
        } else if(!/^[0-9]+$/.test(frequenza)){
            alert('Frequenza deve essere un numero'); return;
            } else if(frequenza < 30 || frequenza > 200) {
                alert('Frequenza non valida min:30 max:200'); return;
        } else if(!/^[0-9]+$/.test(pressionemax) || !/^[0-9]+$/.test(pressionemin)){
            alert('Pressione deve essere un numero'); return;
            } else if(pressionemin < 50 || pressionemin > 200 || pressionemax < 50 || pressionemax > 200) {
                alert('Pressione minima da 50 a 200 \nPressione massima da 50 a 200'); return;
        } else if(!/^[0-9]+$/.test(saturazione)){
                alert('Saturazione deve essere un numero'); return;
            } else if(saturazione < 0 || saturazione > 100) {
                alert('Saturazione non valida min:50 max:100'); return;
            }
            
            let colore = '';
            if ((temperatura >= 39 || temperatura <= 35) || 
                (frequenza >= 120 || frequenza <= 50) || 
                (pressionemax > 140 || pressionemax < 90) || 
                (pressionemin > 90 || pressionemin < 60) || 
                saturazione < 60) {
                colore = 'rosso';
            } else if ((temperatura > 38 && temperatura <= 38.9) || 
                       (frequenza >= 101 && frequenza <= 120) || 
                       (pressionemax >= 121 && pressionemax <= 140) || 
                       (pressionemin >= 81 && pressionemin <= 90) || 
                       (saturazione < 95 && saturazione >= 90)) {
                colore = 'giallo';
            } else {
                colore = 'verde';
            }
    /* 
        A questo punto dobbiamo inserire i dati del paziente in una tabella
        e colorare la riga in base alla gravità del paziente.
        Inoltre i dati devono essere salvati in localStorage per poterli recuperare
        in caso di refresh della pagina.
    */
            
        let newRow = `<tr class="${colore}">
        <td>${nome.toUpperCase()}</td>
        <td>${cognome.toUpperCase()}</td>
        <td>${eta}</td>
        <td>${temperatura}</td>
        <td>${frequenza}</td>
        <td>${saturazione}</td>
        <td>${pressionemax}/${pressionemin}</td>
        <td>${colore.toUpperCase()}</td>
        <td><button class="btn btn-primary" disabled>Presa in carico</button></td>
        </tr>`;
        $("#pazienti-body").append(newRow);
        localStorage.setItem('pazienti', $("#pazienti-body").html());
        $("#form")[0].reset();
        OrdinamentoTabella();
    });
});
