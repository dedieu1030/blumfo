
# Configuration de l'intégration Clerk avec Supabase

Pour que l'authentification Clerk fonctionne correctement avec Supabase et que les utilisateurs soient synchronisés correctement, suivez ces étapes :

## 1. Configurer un template JWT dans Clerk

1. Connectez-vous à votre [dashboard Clerk](https://dashboard.clerk.dev/)
2. Allez dans **JWT Templates** dans la barre latérale
3. Cliquez sur **Nouveau Template**
4. Nommez-le exactement `supabase`
5. Configurez le template avec les paramètres suivants :

```json
{
  "iss": "https://your-clerk-instance.clerk.accounts.dev/",
  "sub": "{{user.id}}",
  "iat": "{{iat}}",
  "exp": "{{exp}}",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "full_name": "{{user.first_name}} {{user.last_name}}",
    "email": "{{user.primary_email_address}}"
  }
}
```

6. Dans les configurations avancées, définissez le temps d'expiration à 3600 secondes (1 heure) ou selon vos besoins
7. Cliquez sur **Créer Template**

## 2. Configurer Supabase pour accepter les JWT de Clerk

1. Allez dans votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Authentication > Settings > URL Configuration**
4. Assurez-vous que les URL de site et de redirection sont correctement configurées

## 3. Tester l'intégration

Après avoir configuré les deux plateformes, testez l'intégration en :

1. Vous déconnectant si vous êtes connecté
2. Créant un nouveau compte utilisateur via l'application
3. Vérifiant que votre profil apparaît correctement dans la base de données Supabase

## Dépannage

Si les utilisateurs n'apparaissent toujours pas dans la base de données Supabase :

1. Vérifiez les logs côté client et dans la console pour toute erreur liée à l'authentification
2. Assurez-vous que le template JWT est correctement nommé `supabase` (sensible à la casse)
3. Vérifiez que les clés Supabase dans votre application sont correctes

Pour plus d'informations, consultez la [documentation officielle d'intégration Clerk-Supabase](https://clerk.com/docs/integrations/databases/supabase).
