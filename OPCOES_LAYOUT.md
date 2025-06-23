# 🎨 3 OPÇÕES DE LAYOUT PARA CONEXÕES WHATSAPP

## 📱 **OPÇÃO 1: CARDS COMPACTOS**
```jsx
{/* CARDS PEQUENOS - 3 POR LINHA */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {instances.map((instance) => (
    <div key={instance.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      {/* Header compacto com foto pequena + status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img className="w-8 h-8 rounded-full" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <h3 className="font-medium text-white text-sm truncate">{instance.name}</h3>
        </div>
        <Badge className="text-xs">🟢</Badge>
      </div>
      
      {/* Informações essenciais */}
      <div className="space-y-2 mb-3">
        <p className="text-xs text-gray-400">{instance.profileName}</p>
        <p className="text-xs font-mono">{instance.phone}</p>
        <p className="text-xs text-gray-500">Ativo há 2h</p>
      </div>

      {/* Estatísticas em linha */}
      <div className="flex justify-between text-xs mb-3 bg-gray-700/30 rounded p-2">
        <span className="text-blue-400">💬 45</span>
        <span className="text-green-400">👥 123</span>
        <span className="text-purple-400">💭 12</span>
      </div>

      {/* Botões pequenos */}
      <div className="flex justify-end gap-1">
        <Button className="h-7 w-7 p-0">⚙️</Button>
        <Button className="h-7 w-7 p-0">🗑️</Button>
      </div>
    </div>
  ))}
</div>
```

**Características:**
- ✅ Compacto, mostra mais instâncias
- ✅ Design limpo e organizado
- ✅ Responsivo (1-2-3 colunas)
- ✅ Informações essenciais visíveis
- ❌ Menos espaço para detalhes

---

## 📋 **OPÇÃO 2: LISTA VERTICAL DETALHADA**
```jsx
{/* LISTA VERTICAL - UMA POR LINHA */}
<div className="space-y-3">
  {instances.map((instance) => (
    <div key={instance.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo - Foto + Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img className="w-12 h-12 rounded-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500"></div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white">{instance.name}</h3>
            <p className="text-sm text-gray-400">{instance.profileName}</p>
            <p className="text-xs font-mono text-gray-500">{instance.phone}</p>
          </div>
        </div>

        {/* Centro - Status + Estatísticas */}
        <div className="flex items-center gap-6">
          <Badge className="bg-green-500/20 text-green-400">🟢 Conectado</Badge>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-400">💬 45 msgs</span>
            <span className="text-green-400">👥 123 contatos</span>
            <span className="text-purple-400">💭 12 chats</span>
          </div>
          
          <span className="text-xs text-gray-500">Ativo há 2h</span>
        </div>

        {/* Lado direito - Ações */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">QR Code</Button>
          <Button variant="ghost" size="sm">⚙️</Button>
          <Button variant="ghost" size="sm">🗑️</Button>
        </div>
      </div>
    </div>
  ))}
</div>
```

**Características:**
- ✅ Muitos detalhes visíveis
- ✅ Fácil de escanear informações
- ✅ Botões com texto explicativo
- ✅ Layout horizontal organizado
- ❌ Ocupa mais espaço vertical

---

## 🎯 **OPÇÃO 3: GRID MASONRY (PINTEREST-STYLE)**
```jsx
{/* GRID DINÂMICO - TAMANHOS VARIADOS */}
<div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
  {instances.map((instance) => (
    <div key={instance.id} className="break-inside-avoid bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 mb-4">
      {/* Header com foto grande */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <img className="w-16 h-16 rounded-full mx-auto mb-2" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-800"></div>
        </div>
        <h3 className="font-bold text-white">{instance.name}</h3>
        <p className="text-sm text-gray-400">{instance.profileName}</p>
      </div>

      {/* Status destacado */}
      <div className="text-center mb-4">
        <Badge className="bg-green-500/20 text-green-400 px-3 py-1">
          🟢 Conectado
        </Badge>
      </div>

      {/* Informações em blocos */}
      <div className="space-y-3">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Contato</div>
          <div className="font-mono text-sm text-white">{instance.phone}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-600/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-400">45</div>
            <div className="text-xs text-gray-400">Msgs</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-400">123</div>
            <div className="text-xs text-gray-400">Contatos</div>
          </div>
          <div className="bg-purple-600/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-400">12</div>
            <div className="text-xs text-gray-400">Chats</div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          Última atividade: há 2 horas
        </div>
      </div>

      {/* Ações em linha */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1">QR Code</Button>
        <Button variant="ghost" size="sm">⚙️</Button>
        <Button variant="ghost" size="sm">🗑️</Button>
      </div>
    </div>
  ))}
</div>
```

**Características:**
- ✅ Visual muito atrativo
- ✅ Cada card é único e destacado
- ✅ Informações bem organizadas em blocos
- ✅ Layout dinâmico tipo Pinterest
- ❌ Pode ser visualmente "pesado"

---

## 🤔 **QUAL VOCÊ PREFERE?**

**Responda com:**
- **"1"** para Cards Compactos
- **"2"** para Lista Vertical Detalhada  
- **"3"** para Grid Masonry (Pinterest-style)

Ou descreva modificações que gostaria em qualquer uma das opções! 