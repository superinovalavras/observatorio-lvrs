"""Define uma senha nova para um usuário do painel, direto no Supabase.

Uso (na pasta do site):  python scripts/definir-senha.py
Pede o e-mail e a senha nova no terminal (a senha não aparece ao digitar).
Lê a URL e a Secret key do .env.local.
"""
import getpass, json, re, urllib.request

env = dict(re.findall(r"(?m)^([A-Z_]+)=(.*)$", open(".env.local", encoding="utf-8").read()))
url, chave = env["NEXT_PUBLIC_SUPABASE_URL"].strip(), env["SUPABASE_SECRET_KEY"].strip()
cab = {"apikey": chave, "Authorization": "Bearer " + chave, "Content-Type": "application/json"}

email = input("E-mail do usuário: ").strip().lower()
usuarios = json.load(urllib.request.urlopen(urllib.request.Request(url + "/auth/v1/admin/users", headers=cab)))["users"]
u = next((x for x in usuarios if x["email"] == email), None)
if not u:
    raise SystemExit("Usuário não encontrado: " + email)

senha = getpass.getpass("Senha nova (mín. 8 caracteres): ")
if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
    raise SystemExit("Senha curta ou diferente na repetição. Nada foi alterado.")

req = urllib.request.Request(url + "/auth/v1/admin/users/" + u["id"], data=json.dumps({"password": senha}).encode(), headers=cab, method="PUT")
urllib.request.urlopen(req)
print("Senha alterada. Entre em /entrar com", email)
