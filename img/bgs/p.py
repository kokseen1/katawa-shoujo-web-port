import glob
files = (glob.glob("img\\bgs\\*.jpg"))

f = [(f.split("\\")[-1]) for f in files]

print(f)
