from setuptools import setup

# pylint: disable=exec-used
exec(open('dash_renderer/version.py').read())

setup(
    name='dash_renderer',
    # pylint: disable=undefined-variable
    version=__version__,  # noqa: F821
    author='Chris Parmer',
    author_email='chris@plot.ly',
    packages=['dash_renderer'],
    include_package_data=True,
    license='MIT',
    description='Front-end component renderer for dash',
    install_requires=[]
)
