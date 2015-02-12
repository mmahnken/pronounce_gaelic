# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pronounce_gaelic', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='game',
            table='games',
        ),
        migrations.AlterModelTable(
            name='referenceword',
            table='reference_words',
        ),
        migrations.AlterModelTable(
            name='userword',
            table='user_words',
        ),
    ]
