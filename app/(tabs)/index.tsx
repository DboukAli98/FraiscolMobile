// app/(tabs)/index.tsx
import { Card, CardBody, CardHeader } from '@/components/Card/CardComponent';
import { GhostIconButton } from '@/components/IconButton/IconButton';
import { IconLabelCard } from '@/components/IconLabelCard/IconLabelCard';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import {
  colors,
  getButtonStyle,
  getTextStyle,
  spacingX,
  spacingY
} from '@/constants/theme';
import { QuickActionData, QuickActionItem } from '@/GeneralData/GeneralData';
import useUserInfo from '@/hooks/useUserInfo';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const userInfo = useUserInfo();


  //#region Handlers

  const handleQuickAction = (action: QuickActionItem) => {
    router.push(action.route as any);
  };


  //#endregion

  return (
    <ScreenView safeArea={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.greetingSection}>
            <Text style={styles.nameTextGreeting}>
              Bonjour,
            </Text>
            <Text style={styles.nameText}>
              {userInfo?.name || ""}
            </Text>
          </View>
          <View style={styles.greetingSection}>
            <GhostIconButton
              iconName="notifications-outline"
              size="md"
              //onPress={() => handlePress('Notifications')}
              accessibilityLabel="Notifications"
            />

          </View>

        </View>

        <Card borderRadius={"_10"} style={styles.cardContainer}>
          <CardHeader titleStyle={styles.cardHeaderTitleStyle} title='Total à payer ce mois-ci' />



        </Card>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>

          <View style={styles.actionsGrid}>
            {QuickActionData.map((action) => (
              <IconLabelCard
                key={action.id}
                imageSource={action.img}
                label={action.label}
                size="sm"
                labelStyle={styles.actionCardLabelStyle}
                onPress={() => handleQuickAction(action)}
                accessibilityLabel={`Accéder à ${action.label}`}
                style={styles.actionCard}
              />
            ))}
          </View>
        </View>
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>

          <Card borderRadius={"_10"} style={styles.cardContainer}>
            <CardBody>
              <Text style={styles.transactionsNotFoundText}>Aucune transaction récente</Text>
            </CardBody>



          </Card>
        </View>



        <View style={styles.actionSection}>
          {/* <Pressable
            style={[styles.merchandiseButton, shadows.md]}
            onPress={() => push("/merchandises")}
          >
            <Text style={styles.buttonText}>Go to Merchandise</Text>
          </Pressable> */}

        </View>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  header: {
    marginBottom: spacingY._30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: "center",

  },
  greetingSection: {
    alignItems: 'flex-start'
  },
  welcomeText: {
    ...getTextStyle('xs', 'bold', colors.primary.main),
    marginBottom: spacingY._7,
    textAlign: 'center',
  },
  nameTextGreeting: {
    ...getTextStyle('sm', 'bold', colors.text.secondary),
    textAlign: 'center',

  },
  nameText: {
    ...getTextStyle('lg', 'extrabold', colors.text.secondary),
    textAlign: 'center',

  },

  cardContainer: {
    backgroundColor: colors.background.default,

  },

  cardHeaderTitleStyle: {
    ...getTextStyle('md', 'bold', colors.text.secondary),
    textAlign: "center"

  },
  quickActionsSection: {

  },
  actionSection: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  transactionsSection: {

  },

  sectionTitle: {
    ...getTextStyle('md', 'semibold', colors.text.secondary),
    marginBottom: spacingY._10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacingX._5,
  },
  actionCard: {
    width: '30%',
    marginBottom: spacingY._15,
    backgroundColor: colors.background.default,
  },
  actionCardLabelStyle: {
    ...getTextStyle('xs', 'medium', colors.text.secondary),


  },
  merchandiseButton: {
    ...getButtonStyle('lg', 'primary'),
    width: "100%",
    marginBottom: spacingY._15,
  },
  buttonText: {
    ...getTextStyle('md', 'semibold', colors.text.white),
  },
  secondaryButton: {
    ...getButtonStyle('md', 'outline'),
    width: "100%",
    marginBottom: spacingY._15,
  },
  secondaryButtonText: {
    ...getTextStyle('base', 'medium', colors.primary.main),
  },
  transactionsNotFoundText: {
    ...getTextStyle('xs', 'bold', colors.primary.main),
    textAlign: 'center',
  }
});