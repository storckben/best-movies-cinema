# Configurações de segurança adicionais
# Este arquivo contém configurações para reforçar a proteção contra crawling e detecção

# Rate limiting (se suportado pelo servidor)
# Limitar requests por IP para impedir crawling automatizado

# Headers de segurança adicionais
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: no-referrer

# Bloqueio de user-agents suspeitos
# (Implementar no servidor ou via middleware)

# Ofuscação adicional
# Considerar implementar WebAssembly para lógica crítica
# Usar CSS para ofuscar seletores de elementos
# Implementar detecção de bots via JavaScript

# Monitoramento
# Logs de acesso devem ser monitorados para detectar padrões de crawling
# Implementar alertas para activity suspeita