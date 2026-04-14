export interface CinemaLocation {
  state: string;
  stateName: string;
  city: string;
  cinema: string;
}

export const cinemaLocations: CinemaLocation[] = [
  // AM
  { state: 'AM', stateName: 'Amazonas', city: 'Manaus', cinema: 'Cinemark Studio 5' },
  // BA
  { state: 'BA', stateName: 'Bahia', city: 'Camaçari', cinema: 'Cinemark Boulevard Shopping Camaçari' },
  { state: 'BA', stateName: 'Bahia', city: 'Juazeiro', cinema: 'Cinemark Juá Garden Shopping' },
  { state: 'BA', stateName: 'Bahia', city: 'Salvador', cinema: 'Cinemark Salvador Shopping' },
  // DF
  { state: 'DF', stateName: 'Distrito Federal', city: 'Brasília', cinema: 'Cinemark Iguatemi Brasília' },
  { state: 'DF', stateName: 'Distrito Federal', city: 'Brasília', cinema: 'Cinemark Pier 21' },
  { state: 'DF', stateName: 'Distrito Federal', city: 'Taguatinga', cinema: 'Cinemark Taguatinga Shopping' },
  // ES
  { state: 'ES', stateName: 'Espírito Santo', city: 'Vila Velha', cinema: 'Cinemark Shopping Vila Velha' },
  { state: 'ES', stateName: 'Espírito Santo', city: 'Vitória', cinema: 'Cinemark Shopping Vitória' },
  // GO
  { state: 'GO', stateName: 'Goiás', city: 'Goiânia', cinema: 'Cinemark Flamboyant' },
  { state: 'GO', stateName: 'Goiás', city: 'Goiânia', cinema: 'Cinemark Passeio das Águas' },
  // MG
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemark BH Shopping' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemark Diamond Mall' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemark Pátio Savassi' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Betim', cinema: 'Cinemark Partage Shopping Betim' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Uberlândia', cinema: 'Cinemark Uberlândia Shopping' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Varginha', cinema: 'Cinemark Via Café Garden Shopping' },
  // MS
  { state: 'MS', stateName: 'Mato Grosso do Sul', city: 'Campo Grande', cinema: 'Cinemark Shopping Campo Grande' },
  // PE
  { state: 'PE', stateName: 'Pernambuco', city: 'Recife', cinema: 'Cinemark RioMar Recife' },
  // PR
  { state: 'PR', stateName: 'Paraná', city: 'Curitiba', cinema: 'Cinemark ParkShoppingBarigüi' },
  { state: 'PR', stateName: 'Paraná', city: 'Curitiba', cinema: 'Cinemark Shopping Mueller' },
  { state: 'PR', stateName: 'Paraná', city: 'Foz do Iguaçu', cinema: 'Cinemark Catuaí Palladium' },
  { state: 'PR', stateName: 'Paraná', city: 'Londrina', cinema: 'Cinemark Boulevard Londrina' },
  { state: 'PR', stateName: 'Paraná', city: 'São José dos Pinhais', cinema: 'Cinemark Shopping São José' },
  // RJ
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Niterói', cinema: 'Cinemark Plaza Shopping Niterói' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Botafogo Praia Shopping' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Carioca Shopping' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Center Shopping Rio (Jacarepaguá)' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Downtown' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Metropolitano Barra' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemark Village Mall' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'São Gonçalo', cinema: 'Cinemark Partage Shopping São Gonçalo' },
  // RN
  { state: 'RN', stateName: 'Rio Grande do Norte', city: 'Natal', cinema: 'Cinemark Midway Mall' },
  // RS
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Canoas', cinema: 'Cinemark Canoas Shopping' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemark BarraShoppingSul' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemark Bourbon Ipiranga' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemark Bourbon Wallig' },
  // SC
  { state: 'SC', stateName: 'Santa Catarina', city: 'Florianópolis', cinema: 'Cinemark Floripa Shopping' },
  { state: 'SC', stateName: 'Santa Catarina', city: 'Lages', cinema: 'Cinemark Lages Garden Shopping' },
  // SE
  { state: 'SE', stateName: 'Sergipe', city: 'Aracaju', cinema: 'Cinemark RioMar Aracaju' },
  { state: 'SE', stateName: 'Sergipe', city: 'Aracaju', cinema: 'Cinemark Shopping Jardins' },
  // SP
  { state: 'SP', stateName: 'São Paulo', city: 'Barueri', cinema: 'Cinemark Shopping Tamboré' },
  { state: 'SP', stateName: 'São Paulo', city: 'Bragança Paulista', cinema: 'Cinemark Bragança Garden Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Campinas', cinema: 'Cinemark Iguatemi Campinas' },
  { state: 'SP', stateName: 'São Paulo', city: 'Cotia', cinema: 'Cinemark Shopping Granja Vianna' },
  { state: 'SP', stateName: 'São Paulo', city: 'Guarulhos', cinema: 'Cinemark Internacional Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Jacareí', cinema: 'Cinemark Jacareí Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Mogi das Cruzes', cinema: 'Cinemark Mogi Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Osasco', cinema: 'Cinemark Shopping União de Osasco' },
  { state: 'SP', stateName: 'São Paulo', city: 'Ribeirão Preto', cinema: 'Cinemark Novo Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Santo André', cinema: 'Cinemark Atrium Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Santo André', cinema: 'Cinemark Grand Plaza Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Bernardo do Campo', cinema: 'Cinemark Extra Anchieta' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Bernardo do Campo', cinema: 'Cinemark Golden Square' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Caetano do Sul', cinema: 'Cinemark ParkShopping São Caetano' },
  { state: 'SP', stateName: 'São Paulo', city: 'São José dos Campos', cinema: 'Cinemark CenterVale Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São José dos Campos', cinema: 'Cinemark Colinas Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Aricanduva' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Boulevard Tatuapé' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Center Norte' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Central Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Cidade Jardim' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Cidade São Paulo' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Eldorado' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Iguatemi SP' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Interlagos' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Lar Center' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Market Place' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Metrô Santa Cruz' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Metrô Tatuapé' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Metrô Tucuruvi' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Mooca Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Pátio Higienópolis' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Pátio Paulista' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Raposo Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Shopping D' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark SP Market' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Tietê Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark Villa Lobos' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemark West Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'Taubaté', cinema: 'Cinemark Via Vale Garden Shopping' },
  // TO
  { state: 'TO', stateName: 'Tocantins', city: 'Palmas', cinema: 'Cinemark Capim Dourado Shopping' },
];

export function getStates() {
  const map = new Map<string, string>();
  cinemaLocations.forEach(l => map.set(l.state, l.stateName));
  return Array.from(map.entries())
    .map(([state, stateName]) => ({ state, stateName }))
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export function getCities(state: string) {
  const cities = new Set(cinemaLocations.filter(l => l.state === state).map(l => l.city));
  return Array.from(cities).sort();
}

export function getCinemas(state: string, city: string) {
  return cinemaLocations
    .filter(l => l.state === state && l.city === city)
    .map(l => l.cinema)
    .sort();
}
