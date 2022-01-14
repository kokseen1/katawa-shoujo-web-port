# import glob
# files = (glob.glob("*.rpy"))

# f = [(f.split("\\")[-1][:-4]) for f in files]
# print(f)

with open(r"assets\script\ui_settings.rpy", "r", encoding="utf8") as f:
    lines = f.read().split("\n")
lines_clean = [line.strip() for line in lines if line]

d = {}
for line in lines_clean:
    if line.startswith("store.") and "Character(displayStrings." in line and "color" in line:
        left, right = line.split(" = Character(displayStrings.")
        d[left[6:]] = right[-9:-2]
nd = {}
for k,v in d.items():
    nd[k] = v
    nd[k+"_"] = v

print(nd)
