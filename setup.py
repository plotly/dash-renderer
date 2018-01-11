from setuptools import setup

main_ns = {}
exec(open('dash_renderer/version.py').read(), main_ns)

setup(
    name='dash_renderer',
    version=main_ns['__version__'],
    author='Chris Parmer',
    author_email='chris@plot.ly',
    packages=['dash_renderer'],
    include_package_data=True,
    license='MIT',
    description='Front-end component renderer for dash',
    install_requires=[]
)
