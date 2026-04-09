export interface CinemaLocation {
  state: string;
  stateName: string;
  city: string;
  cinema: string;
}

export const cinemaLocations: CinemaLocation[] = [
  // AM
  { state: 'AM', stateName: 'Amazonas', city: 'Manaus', cinema: 'Cinemak Studio 5' },
  // BA
  { state: 'BA', stateName: 'Bahia', city: 'Camaçari', cinema: 'Cinemak Boulevard Shopping Camaçari' },
  { state: 'BA', stateName: 'Bahia', city: 'Juazeiro', cinema: 'Cinemak Juá Garden Shopping' },
  { state: 'BA', stateName: 'Bahia', city: 'Salvador', cinema: 'Cinemak Salvador Shopping' },
  // DF
  { state: 'DF', stateName: 'Distrito Federal', city: 'Brasília', cinema: 'Cinemak Iguatemi Brasília' },
  { state: 'DF', stateName: 'Distrito Federal', city: 'Brasília', cinema: 'Cinemak Pier 21' },
  { state: 'DF', stateName: 'Distrito Federal', city: 'Taguatinga', cinema: 'Cinemak Taguatinga Shopping' },
  // ES
  { state: 'ES', stateName: 'Espírito Santo', city: 'Vila Velha', cinema: 'Cinemak Shopping Vila Velha' },
  { state: 'ES', stateName: 'Espírito Santo', city: 'Vitória', cinema: 'Cinemak Shopping Vitória' },
  // GO
  { state: 'GO', stateName: 'Goiás', city: 'Goiânia', cinema: 'Cinemak Flamboyant' },
  { state: 'GO', stateName: 'Goiás', city: 'Goiânia', cinema: 'Cinemak Passeio das Águas' },
  // MG
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemak BH Shopping' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemak Diamond Mall' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Belo Horizonte', cinema: 'Cinemak Pátio Savassi' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Betim', cinema: 'Cinemak Partage Shopping Betim' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Uberlândia', cinema: 'Cinemak Uberlândia Shopping' },
  { state: 'MG', stateName: 'Minas Gerais', city: 'Varginha', cinema: 'Cinemak Via Café Garden Shopping' },
  // MS
  { state: 'MS', stateName: 'Mato Grosso do Sul', city: 'Campo Grande', cinema: 'Cinemak Shopping Campo Grande' },
  // PE
  { state: 'PE', stateName: 'Pernambuco', city: 'Recife', cinema: 'Cinemak RioMar Recife' },
  // PR
  { state: 'PR', stateName: 'Paraná', city: 'Curitiba', cinema: 'Cinemak ParkShoppingBarigüi' },
  { state: 'PR', stateName: 'Paraná', city: 'Curitiba', cinema: 'Cinemak Shopping Mueller' },
  { state: 'PR', stateName: 'Paraná', city: 'Foz do Iguaçu', cinema: 'Cinemak Catuaí Palladium' },
  { state: 'PR', stateName: 'Paraná', city: 'Londrina', cinema: 'Cinemak Boulevard Londrina' },
  { state: 'PR', stateName: 'Paraná', city: 'São José dos Pinhais', cinema: 'Cinemak Shopping São José' },
  // RJ
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Niterói', cinema: 'Cinemak Plaza Shopping Niterói' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Botafogo Praia Shopping' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Carioca Shopping' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Center Shopping Rio (Jacarepaguá)' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Downtown' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Metropolitano Barra' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'Rio de Janeiro', cinema: 'Cinemak Village Mall' },
  { state: 'RJ', stateName: 'Rio de Janeiro', city: 'São Gonçalo', cinema: 'Cinemak Partage Shopping São Gonçalo' },
  // RN
  { state: 'RN', stateName: 'Rio Grande do Norte', city: 'Natal', cinema: 'Cinemak Midway Mall' },
  // RS
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Canoas', cinema: 'Cinemak Canoas Shopping' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemak BarraShoppingSul' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemak Bourbon Ipiranga' },
  { state: 'RS', stateName: 'Rio Grande do Sul', city: 'Porto Alegre', cinema: 'Cinemak Bourbon Wallig' },
  // SC
  { state: 'SC', stateName: 'Santa Catarina', city: 'Florianópolis', cinema: 'Cinemak Floripa Shopping' },
  { state: 'SC', stateName: 'Santa Catarina', city: 'Lages', cinema: 'Cinemak Lages Garden Shopping' },
  // SE
  { state: 'SE', stateName: 'Sergipe', city: 'Aracaju', cinema: 'Cinemak RioMar Aracaju' },
  { state: 'SE', stateName: 'Sergipe', city: 'Aracaju', cinema: 'Cinemak Shopping Jardins' },
  // SP
  { state: 'SP', stateName: 'São Paulo', city: 'Barueri', cinema: 'Cinemak Shopping Tamboré' },
  { state: 'SP', stateName: 'São Paulo', city: 'Bragança Paulista', cinema: 'Cinemak Bragança Garden Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Campinas', cinema: 'Cinemak Iguatemi Campinas' },
  { state: 'SP', stateName: 'São Paulo', city: 'Cotia', cinema: 'Cinemak Shopping Granja Vianna' },
  { state: 'SP', stateName: 'São Paulo', city: 'Guarulhos', cinema: 'Cinemak Internacional Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Jacareí', cinema: 'Cinemak Jacareí Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Mogi das Cruzes', cinema: 'Cinemak Mogi Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Osasco', cinema: 'Cinemak Shopping União de Osasco' },
  { state: 'SP', stateName: 'São Paulo', city: 'Ribeirão Preto', cinema: 'Cinemak Novo Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Santo André', cinema: 'Cinemak Atrium Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'Santo André', cinema: 'Cinemak Grand Plaza Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Bernardo do Campo', cinema: 'Cinemak Extra Anchieta' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Bernardo do Campo', cinema: 'Cinemak Golden Square' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Caetano do Sul', cinema: 'Cinemak ParkShopping São Caetano' },
  { state: 'SP', stateName: 'São Paulo', city: 'São José dos Campos', cinema: 'Cinemak CenterVale Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São José dos Campos', cinema: 'Cinemak Colinas Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Aricanduva' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Boulevard Tatuapé' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Center Norte' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Central Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Cidade Jardim' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Cidade São Paulo' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Eldorado' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Iguatemi SP' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Interlagos' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Lar Center' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Market Place' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Metrô Santa Cruz' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Metrô Tatuapé' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Metrô Tucuruvi' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Mooca Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Pátio Higienópolis' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Pátio Paulista' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Raposo Shopping' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Shopping D' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak SP Market' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Tietê Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak Villa Lobos' },
  { state: 'SP', stateName: 'São Paulo', city: 'São Paulo', cinema: 'Cinemak West Plaza' },
  { state: 'SP', stateName: 'São Paulo', city: 'Taubaté', cinema: 'Cinemak Via Vale Garden Shopping' },
  // TO
  { state: 'TO', stateName: 'Tocantins', city: 'Palmas', cinema: 'Cinemak Capim Dourado Shopping' },
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
