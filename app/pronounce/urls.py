from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pronounce.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^pronounce_gaelic/', include('pronounce_gaelic.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
